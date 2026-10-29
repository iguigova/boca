import { test, mock } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import { commentable, pageof } from "../src/page.js";
import {
    COMMENT, comment, reply, sign, newsecret, pubkeyof, valid
} from "../src/event.js";
import { TIMEOUT, fetchcomments, publish } from "../src/relay.js";
import { thread, count } from "../src/thread.js";
import {
    secretof, setsecret, signingof, setsigning, mutelistof, setmutelist
} from "../src/store.js";
import { npub, nsec, secretfrom } from "../src/keys.js";
import {
    MUTELIST, mutedin, withmute, withoutmute, newest
} from "../src/mutes.js";
import { localsigner, nip07signer, signerpubkey } from "../src/signer.js";
import { relays, storagearea, scriptingwith, nostrof } from "./fakes.js";

const PAGE = "https://example.com/post?id=7";
const ADA = newsecret();
const GRACE = newsecret();

// --- page -------------------------------------------------------------------

test("only http and https pages are commentable", () => {
    assert.equal(commentable("https://example.com/"), true);
    assert.equal(commentable("http://example.com/"), true);
    assert.equal(commentable("chrome://extensions/"), false);
    assert.equal(commentable("not a url"), false);
});

test("a page is its normalized url without the fragment", () => {
    assert.equal(
        pageof("HTTPS://Example.COM:443/post?id=7#reply-3"), PAGE);
    assert.equal(pageof("https://example.com"), "https://example.com/");
});

test("a page that is not on the web is refused", () => {
    assert.throws(() => pageof("file:///etc/hosts"), /not a web page/);
});

// --- event ------------------------------------------------------------------

test("a comment is rooted on the page and answers the page", () => {
    const event = comment(PAGE, "hi", 100);
    assert.equal(event.kind, COMMENT);
    assert.deepEqual(event.tags, [
        ["I", PAGE], ["K", "web"], ["i", PAGE], ["k", "web"]
    ]);
});

test("a reply is rooted on the page and answers its parent", () => {
    const parent = sign(ADA, comment(PAGE, "hi", 100));
    const event = reply(PAGE, parent, "hello", 200);
    assert.deepEqual(event.tags, [
        ["I", PAGE], ["K", "web"],
        ["e", parent.id, "", parent.pubkey],
        ["k", "1111"],
        ["p", parent.pubkey]
    ]);
});

test("a signed event carries its author and checks out", () => {
    const event = sign(ADA, comment(PAGE, "hi", 100));
    assert.equal(event.pubkey, pubkeyof(ADA));
    assert.equal(valid(event), true);
});

test("the id is NIP-01's hash of the serialized event", () => {
    const event = sign(ADA, comment(PAGE, "hi", 100));
    assert.equal(event.id, nip01id(event));
    assert.equal(valid({ ...event, content: "bye" }), false);
});

function nip01id(event) {
    const { pubkey, created_at, kind, tags, content } = event;
    const serialized = JSON.stringify(
        [0, pubkey, created_at, kind, tags, content]);
    return createHash("sha256").update(serialized).digest("hex");
}

test("a correctly hashed event from a key off the curve is invalid", () => {
    const event = { ...sign(ADA, comment(PAGE, "hi", 100)) };
    event.pubkey = "f".repeat(64);
    event.id = nip01id(event);
    assert.equal(valid(event), false);
});

test("a malformed or forged event is invalid", () => {
    const event = sign(ADA, comment(PAGE, "hi", 100));
    const forged = { ...event, pubkey: pubkeyof(GRACE) };
    assert.equal(valid(forged), false);
    assert.equal(valid({ ...event, sig: "zz" }), false);
    assert.equal(valid({ ...event, tags: "I" }), false);
    assert.equal(valid({ ...event, created_at: "100" }), false);
    assert.equal(valid({ ...event, content: 7 }), false);
    assert.equal(valid(null), false);
});

// --- relay ------------------------------------------------------------------

const ALPHA = "wss://alpha.example";
const BETA = "wss://beta.example";

function storing(events) {
    return ([type, subscription], socket) => {
        if (type !== "REQ") return;
        for (const e of events) {
            socket.reply(JSON.stringify(["EVENT", subscription, e]));
        }
        socket.reply(JSON.stringify(["EOSE", subscription]));
    };
}

function accepting(accepted, reason = "") {
    return ([type, event], socket) => {
        if (type !== "EVENT") return;
        socket.reply(JSON.stringify(["NOTICE", "hello"]));
        socket.reply(JSON.stringify(["OK", "other", true, ""]));
        socket.reply(JSON.stringify(["OK", event.id, accepted, reason]));
    };
}

test("comments are asked for by kind and page, from every relay", async () => {
    const event = sign(ADA, comment(PAGE, "hi", 100));
    const fake = relays(storing([event]));
    const got = await fetchcomments(fake.open, [ALPHA, BETA], PAGE);
    assert.deepEqual(got, { events: [event, event], failed: [] });
    assert.deepEqual(fake.sent[0].message,
        ["REQ", "boca", { kinds: [1111], "#I": [PAGE] }]);
});

test("a relay that fails is named and the rest still answer", async () => {
    const fake = relays(storing([]), { refuse: [BETA] });
    const got = await fetchcomments(fake.open, [ALPHA, BETA], PAGE);
    assert.deepEqual(got, { events: [], failed: [BETA] });
});

test("a relay that closes the request or talks nonsense fails", async () => {
    const closing = ([, subscription], socket) =>
        socket.reply(JSON.stringify(["CLOSED", subscription, "blocked"]));
    const babbling = (_, socket) => socket.reply("not json");
    for (const answer of [closing, babbling]) {
        const fake = relays(answer);
        await assert.rejects(fetchcomments(fake.open, [ALPHA], PAGE),
            /no relay answered/);
    }
});

test("a relay that never answers times out and its socket closes",
    async () => {
        mock.timers.enable({ apis: ["setTimeout"] });
        const fake = relays(storing([]), { silent: [ALPHA] });
        let socket;
        const open = (url) => (socket = fake.open(url));
        const pending = fetchcomments(open, [ALPHA], PAGE);
        mock.timers.tick(TIMEOUT);
        await assert.rejects(pending, /no relay answered/);
        assert.equal(socket.closed, true);
        mock.timers.reset();
    });

test("an event is published to every relay that accepts it", async () => {
    const event = sign(ADA, comment(PAGE, "hi", 100));
    const fake = relays(accepting(true));
    const got = await publish(fake.open, [ALPHA, BETA], event);
    assert.deepEqual(got, { failed: [] });
    assert.deepEqual(fake.sent[0].message, ["EVENT", event]);
});

test("an event no relay accepts is not published", async () => {
    const event = sign(ADA, comment(PAGE, "hi", 100));
    const fake = relays(accepting(false, "blocked: spam"));
    await assert.rejects(publish(fake.open, [ALPHA], event),
        /no relay answered/);
});

// --- thread -----------------------------------------------------------------

test("the discussion nests replies under parents, oldest first", () => {
    const first = sign(ADA, comment(PAGE, "first", 100));
    const second = sign(GRACE, comment(PAGE, "second", 200));
    const answer = sign(GRACE, reply(PAGE, first, "answer", 300));
    const later = sign(ADA, reply(PAGE, first, "later", 400));
    const roots = thread(PAGE, new Set(),
        [later, second, answer, first, first]);
    const shape = (node) =>
        [node.event.content, node.replies.map(shape)];
    assert.deepEqual(roots.map(shape), [
        ["first", [["answer", []], ["later", []]]],
        ["second", []]
    ]);
    assert.equal(count(roots), 4);
});

test("the discussion drops other pages, other kinds and forgeries", () => {
    const elsewhere = sign(ADA, comment("https://example.org/", "x", 100));
    const note = sign(ADA, { ...comment(PAGE, "x", 100), kind: 1 });
    const good = sign(ADA, comment(PAGE, "ok", 100));
    const forged = { ...good, content: "changed" };
    const roots = thread(PAGE, new Set(), [elsewhere, note, forged, good]);
    assert.deepEqual(roots.map((n) => n.event.content), ["ok"]);
});

test("muted authors are dropped and their repliers stand at the top",
    () => {
        const first = sign(ADA, comment(PAGE, "first", 100));
        const answer = sign(GRACE, reply(PAGE, first, "answer", 200));
        const roots = thread(PAGE, new Set([pubkeyof(ADA)]),
            [first, answer]);
        assert.deepEqual(roots.map((n) => n.event.content), ["answer"]);
    });

// --- store ------------------------------------------------------------------

test("the secret is made once, kept, and can be replaced", async () => {
    const area = storagearea();
    const made = await secretof(area);
    assert.match(made, /^[0-9a-f]{64}$/);
    assert.equal(await secretof(area), made);
    await setsecret(area, ADA);
    assert.equal(await secretof(area), ADA);
});

test("signing is local until a signer is chosen", async () => {
    const area = storagearea();
    assert.deepEqual(await signingof(area), { by: "local" });
    await setsigning(area, { by: "nip07", pubkey: "ab" });
    assert.deepEqual(await signingof(area), { by: "nip07", pubkey: "ab" });
});

test("the kept mute list is one author's", async () => {
    const area = storagearea();
    const list = sign(ADA, withmute(undefined, "b".repeat(64), 100));
    assert.equal(await mutelistof(area, pubkeyof(ADA)), undefined);
    await setmutelist(area, list);
    assert.equal(await mutelistof(area, pubkeyof(ADA)), list);
    assert.equal(await mutelistof(area, pubkeyof(GRACE)), undefined);
});

// --- keys -------------------------------------------------------------------

test("keys read and write as NIP-19 bech32", () => {
    // NIP-19's own example.
    const hex = "3bf0c63fcb93463407af97a5e5ee64fa"
        + "883d107ef9e558472c4eb9aaaefa459d";
    assert.equal(npub(hex), "npub180cvv07tjdrrgpa0j7j7tmnyl2yr6yr7l8j4s3"
        + "evf6u64th6gkwsyjh6w6");
    assert.equal(secretfrom(nsec(ADA)), ADA);
    assert.equal(secretfrom(` ${ADA.toUpperCase()} `), ADA);
});

test("anything but a usable secret key is refused", () => {
    assert.throws(() => secretfrom(npub(pubkeyof(ADA))),
        /an npub is not a secret key/);
    assert.throws(() => secretfrom("hello"));
    assert.throws(() => secretfrom("0".repeat(64)));
});

// --- mutes ------------------------------------------------------------------

const BOB = "b".repeat(64);
const EVE = "e".repeat(64);

test("a mute list is NIP-51's kind 10000 with p tags", () => {
    const list = withmute(undefined, BOB, 100);
    assert.deepEqual(list, {
        kind: MUTELIST, created_at: 100, tags: [["p", BOB]], content: ""
    });
    assert.deepEqual(mutedin(list), new Set([BOB]));
    assert.deepEqual(mutedin(undefined), new Set());
});

test("a change keeps the tags and content other clients wrote", () => {
    const theirs = sign(ADA, {
        kind: MUTELIST, created_at: 500, content: "encrypted",
        tags: [["t", "spam"], ["p", BOB], ["word", "crypto"]]
    });
    const added = withmute(theirs, EVE, 100);
    assert.deepEqual(added.tags,
        [["t", "spam"], ["p", BOB], ["word", "crypto"], ["p", EVE]]);
    assert.equal(added.content, "encrypted");
    assert.equal(added.created_at, 501);
    const removed = withoutmute(theirs, BOB, 900);
    assert.deepEqual(removed.tags, [["t", "spam"], ["word", "crypto"]]);
    assert.equal(removed.created_at, 900);
});

test("the newest valid list by its author wins", () => {
    const old = sign(ADA, withmute(undefined, BOB, 100));
    const fresh = sign(ADA, withmute(undefined, EVE, 200));
    const foreign = sign(GRACE, withmute(undefined, BOB, 300));
    const forged = { ...fresh, created_at: 400 };
    const me = pubkeyof(ADA);
    assert.equal(newest(me, [old, fresh, foreign, forged, undefined]), fresh);
    assert.equal(newest(me, []), undefined);
});

// --- signers ----------------------------------------------------------------

test("the local signer signs with the kept key", async () => {
    const area = storagearea({ secret: ADA });
    const signer = localsigner(area);
    assert.equal(await signer.pubkey(), pubkeyof(ADA));
    const event = await signer.sign(comment(PAGE, "hi", 100));
    assert.equal(event.pubkey, pubkeyof(ADA));
    assert.equal(valid(event), true);
});

test("a NIP-07 signer is asked through the page in the tab", async () => {
    const scripting = scriptingwith(nostrof(GRACE));
    const pubkey = await signerpubkey(scripting, 7);
    assert.equal(pubkey, pubkeyof(GRACE));
    const signer = nip07signer(scripting, () => 7, pubkey);
    assert.equal(await signer.pubkey(), pubkey);
    const event = await signer.sign(comment(PAGE, "hi", 100));
    assert.equal(event.pubkey, pubkey);
    const [first] = scripting.calls;
    assert.deepEqual([first.target, first.world, first.args],
        [{ tabId: 7 }, "MAIN", ["pubkey", null]]);
});

test("a page without a signer, or a refusing one, says so", async () => {
    await assert.rejects(signerpubkey(scriptingwith(undefined), 7),
        /no NIP-07 signer on this page/);
    const refusing = { getPublicKey: async () => { throw new Error("no"); } };
    await assert.rejects(signerpubkey(scriptingwith(refusing), 7), /^Error: no$/);
    const odd = { getPublicKey: async () => { throw "denied"; } };
    await assert.rejects(signerpubkey(scriptingwith(odd), 7), /denied/);
    const blank = { getPublicKey: async () => "npub1..." };
    await assert.rejects(signerpubkey(scriptingwith(blank), 7),
        /the signer gave no public key/);
});

test("an event a signer returns for another key or forged is refused",
    async () => {
        const signer = nip07signer(
            scriptingwith(nostrof(GRACE)), () => 7, pubkeyof(ADA));
        await assert.rejects(signer.sign(comment(PAGE, "hi", 100)),
            /does not check out/);
        const forging = {
            signEvent: async (u) => ({ ...sign(GRACE, u), content: "x" })
        };
        const tricked = nip07signer(
            scriptingwith(forging), () => 7, pubkeyof(GRACE));
        await assert.rejects(tricked.sign(comment(PAGE, "hi", 100)),
            /does not check out/);
    });
