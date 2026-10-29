import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseHTML } from "linkedom";

import { start, RELAYS } from "../src/panel.js";
import { comment, sign, newsecret, pubkeyof } from "../src/event.js";
import { npub, nsec } from "../src/keys.js";
import { withmute } from "../src/mutes.js";
import {
    relays, storagearea, scriptingwith, nostrof
} from "./fakes.js";

const HTML = readFileSync(new URL("../static/panel.html", import.meta.url));
const PAGE = "https://example.com/post";
const OTHER = "https://example.org/";
const ADA = newsecret();
const GRACE = newsecret();

// --- harness ----------------------------------------------------------------

// A relay that keeps what it is sent and answers requests from it.
function relay(stored = []) {
    return (message, socket) => {
        const [type] = message;
        if (type === "EVENT") {
            stored.push(message[1]);
            socket.reply(JSON.stringify(["OK", message[1].id, true, ""]));
        }
        if (type === "REQ") {
            const [, subscription, filter] = message;
            for (const e of stored.filter((e) => matches(filter, e))) {
                socket.reply(JSON.stringify(["EVENT", subscription, e]));
            }
            socket.reply(JSON.stringify(["EOSE", subscription]));
        }
    };
}

function matches(filter, e) {
    const page = filter["#I"]?.[0];
    return filter.kinds.includes(e.kind)
        && (!filter.authors || filter.authors.includes(e.pubkey))
        && (!page || e.tags.some(([n, v]) => n === "I" && v === page));
}

function pagerequests(fake) {
    return fake.sent.filter(({ message }) =>
        message[0] === "REQ" && message[2]["#I"]);
}

// stored seeds the extension's storage; nostr is the signer the page in
// the tab offers, if any; grant answers the request for page access.
function browser(url, { stored = {}, nostr, grant = true } = {}) {
    const listeners = { activated: [], updated: [] };
    const tabs = {
        url: url,
        query: async () =>
            (tabs.url === undefined ? [] : [{ id: 7, url: tabs.url }]),
        onActivated: { addListener: (f) => listeners.activated.push(f) },
        onUpdated: { addListener: (f) => listeners.updated.push(f) }
    };
    const requested = [];
    return {
        storage: { local: storagearea(stored) },
        windows: { getCurrent: async () => ({ id: 1 }) },
        permissions: {
            request: async (asked) => (requested.push(asked), grant)
        },
        scripting: scriptingwith(nostr),
        tabs: tabs,
        listeners: listeners,
        requested: requested
    };
}

async function settled() {
    for (let i = 0; i < 5; i++) await new Promise((r) => setTimeout(r, 0));
}

// launch hands back the panel before its first page has loaded; open
// waits for that load.
function launch(url, answer, options, setup) {
    const { document } = parseHTML(HTML.toString());
    const chrome = browser(url, setup);
    const fake = relays(answer, options);
    const started = start({ doc: document, chrome: chrome, open: fake.open });
    return { started: started, doc: document, chrome: chrome, fake: fake };
}

async function open(url, answer, options, setup) {
    const launched = launch(url, answer, options, setup);
    await launched.started;
    return launched;
}

function text(doc, id) {
    return doc.getElementById(id).textContent;
}

function contents(doc) {
    return [...doc.querySelectorAll("#comments .text")]
        .map((n) => n.textContent);
}

function buttonnamed(doc, name) {
    return [...doc.querySelectorAll("button")]
        .find((b) => b.textContent === name);
}

async function write(doc, value) {
    doc.getElementById("text").value = value;
    await doc.getElementById("compose").onsubmit({ preventDefault() {} });
    await settled();
}

// --- showing ----------------------------------------------------------------

test("the panel shows the active page's comments from every relay", async () => {
    const first = sign(ADA, comment(PAGE, "first", 100));
    const { doc, fake } = await open(PAGE, relay([first]));
    assert.equal(text(doc, "page"), PAGE);
    assert.equal(text(doc, "status"), "1 comment.");
    assert.deepEqual(contents(doc), ["first"]);
    assert.deepEqual(pagerequests(fake).map((s) => s.url), RELAYS);
    assert.match(text(doc, "identity"), /public.*You post as [0-9a-f]{8}\./);
    assert.equal(doc.querySelector("time").getAttribute("datetime"),
        "1970-01-01T00:01:40.000Z");
});

test("a tab that is not a web page asks nothing", async () => {
    for (const url of ["chrome://extensions/", undefined]) {
        const { doc, fake } = await open(url, relay());
        assert.match(text(doc, "status"), /this tab is not one/);
        assert.equal(doc.getElementById("compose").hidden, true);
        assert.equal(pagerequests(fake).length, 0);
    }
});

test("relays that fail are named, and none answering is said", async () => {
    const some = await open(PAGE, relay(), { refuse: [RELAYS[1]] });
    assert.equal(text(some.doc, "status"),
        `0 comments. ${RELAYS[1]} did not answer.`);
    const none = await open(PAGE, relay(), { refuse: RELAYS });
    assert.equal(text(none.doc, "status"),
        "Could not load comments: no relay answered.");
});

// --- posting ----------------------------------------------------------------

test("a comment is posted, shown and the box cleared", async () => {
    const stored = [];
    const { doc, chrome } = await open(PAGE, relay(stored));
    await write(doc, "  hello  ");
    assert.equal(text(doc, "status"), "Posted.");
    assert.deepEqual(contents(doc), ["hello"]);
    assert.equal(doc.getElementById("text").value, "");
    const secret = chrome.storage.local.data.get("secret");
    assert.equal(stored[0].pubkey, pubkeyof(secret));
});

test("an empty comment is not posted", async () => {
    const { doc, fake } = await open(PAGE, relay());
    const before = fake.sent.length;
    await write(doc, "   ");
    assert.equal(fake.sent.length, before);
});

test("a reply is posted under its parent, and a reply can be cancelled",
    async () => {
        const first = sign(ADA, comment(PAGE, "first", 100));
        const { doc } = await open(PAGE, relay([first]));
        const who = pubkeyof(ADA).slice(0, 8);
        buttonnamed(doc, `Reply to ${who}`).click();
        assert.equal(doc.getElementById("replying").hidden, false);
        assert.equal(text(doc, "replying-to"), `Replying to ${who}`);
        doc.getElementById("cancel").click();
        assert.equal(doc.getElementById("replying").hidden, true);
        buttonnamed(doc, `Reply to ${who}`).click();
        await write(doc, "answer");
        const nested = doc.querySelectorAll("#comments ol ol .text");
        assert.deepEqual([...nested].map((n) => n.textContent), ["answer"]);
        assert.equal(doc.getElementById("replying").hidden, true);
    });

test("a comment no relay accepts keeps the reader's text", async () => {
    const refusing = (message, socket) => socket.reply(
        JSON.stringify(["OK", message[1].id, false, "blocked"]));
    const { doc } = await open(PAGE, (message, socket) =>
        (message[0] === "REQ" ? relay()(message, socket)
            : refusing(message, socket)));
    await write(doc, "hello");
    assert.equal(text(doc, "status"),
        "Not posted: no relay answered. Your text is still here.");
    assert.equal(doc.getElementById("text").value, "hello");
});

test("a comment some relays refuse names them", async () => {
    const answer = relay();
    const { doc } = await open(PAGE, (message, socket) =>
        (message[0] === "EVENT" && socket.url === RELAYS[2]
            ? socket.onerror()
            : answer(message, socket)));
    await write(doc, "hello");
    assert.equal(text(doc, "status"),
        `Posted. ${RELAYS[2]} did not answer.`);
});

// --- muting -----------------------------------------------------------------

function listsin(stored) {
    return stored.filter((e) => e.kind === 10000);
}

test("muting hides an author and saves the list to the relays", async () => {
    const stored = [sign(ADA, comment(PAGE, "first", 100))];
    const { doc } = await open(PAGE, relay(stored), {},
        { stored: { secret: GRACE } });
    const who = pubkeyof(ADA).slice(0, 8);
    buttonnamed(doc, `Mute ${who}`).click();
    await settled();
    assert.deepEqual(contents(doc), []);
    assert.equal(text(doc, "status"), `Muted ${who}.`);
    const [list] = listsin(stored);
    assert.equal(list.pubkey, pubkeyof(GRACE));
    assert.deepEqual(list.tags, [["p", pubkeyof(ADA)]]);
    buttonnamed(doc, `Unmute ${who}`).click();
    await settled();
    assert.deepEqual(contents(doc), ["first"]);
    assert.equal(text(doc, "status"), `Unmuted ${who}.`);
    assert.equal(buttonnamed(doc, `Unmute ${who}`), undefined);
});

test("the mute list on the relays follows the key here", async () => {
    const list = sign(GRACE, withmute(undefined, pubkeyof(ADA), 100));
    const stored = [sign(ADA, comment(PAGE, "first", 100)), list];
    const { doc, chrome } = await open(PAGE, relay(stored), {},
        { stored: { secret: GRACE } });
    assert.deepEqual(contents(doc), []);
    assert.deepEqual(chrome.storage.local.data.get("mutelist"), list);
});

test("a newer list kept here outlives an older one on the relays",
    async () => {
        const older = sign(GRACE, withmute(undefined, pubkeyof(ADA), 100));
        const newer = sign(GRACE, { ...older, tags: [], created_at: 200 });
        const stored = [sign(ADA, comment(PAGE, "first", 100)), older];
        const { doc } = await open(PAGE, relay(stored), {},
            { stored: { secret: GRACE, mutelist: newer } });
        assert.deepEqual(contents(doc), ["first"]);
    });

test("a mute no relay takes is kept here and said", async () => {
    const answer = relay([sign(ADA, comment(PAGE, "first", 100))]);
    const { doc } = await open(PAGE, (message, socket) =>
        (message[0] === "EVENT" ? socket.onerror() : answer(message, socket)));
    const who = pubkeyof(ADA).slice(0, 8);
    buttonnamed(doc, `Mute ${who}`).click();
    await settled();
    assert.deepEqual(contents(doc), []);
    assert.equal(text(doc, "status"), `Muted ${who} here, but no relay `
        + "took your mute list: no relay answered.");
});

// --- the key ----------------------------------------------------------------

test("the key can be shown for a backup", async () => {
    const { doc } = await open(PAGE, relay(), {},
        { stored: { secret: GRACE } });
    assert.equal(doc.getElementById("npub").value, npub(pubkeyof(GRACE)));
    assert.equal(doc.getElementById("nsec").hidden, true);
    let selected = false;
    // linkedom has no select(); a browser selects the key for copying.
    doc.getElementById("nsec").select = () => { selected = true; };
    doc.getElementById("reveal").click();
    await settled();
    assert.equal(doc.getElementById("nsec").hidden, false);
    assert.equal(doc.getElementById("nsec").value, nsec(GRACE));
    assert.equal(selected, true);
});

test("another key can be used, and a wrong one is refused", async () => {
    const { doc, chrome } = await open(PAGE, relay(), {},
        { stored: { secret: GRACE } });
    const field = doc.getElementById("import");
    field.value = "npub1nothing";
    doc.getElementById("use").click();
    await settled();
    assert.equal(field.getAttribute("aria-invalid"), "true");
    assert.match(text(doc, "import-error"), /^That is not a secret key/);
    assert.equal(chrome.storage.local.data.get("secret"), GRACE);
    field.value = nsec(ADA);
    doc.getElementById("use").click();
    await settled();
    const who = pubkeyof(ADA).slice(0, 8);
    assert.equal(chrome.storage.local.data.get("secret"), ADA);
    assert.equal(field.value, "");
    assert.equal(field.hasAttribute("aria-invalid"), false);
    assert.equal(text(doc, "import-error"), "");
    assert.equal(text(doc, "status"), `Now posting as ${who}.`);
    assert.match(text(doc, "identity"), new RegExp(`You post as ${who}`));
});

test("a mute list asked for under an old key is not applied", async () => {
    const list = sign(GRACE, withmute(undefined, pubkeyof(ADA), 100));
    const stored = [sign(ADA, comment(PAGE, "first", 100)), list];
    const held = [];
    const answer = relay(stored);
    const { doc } = await open(PAGE, (message, socket) =>
        (message[2]?.authors?.includes(pubkeyof(GRACE))
            ? held.push({ message, socket })
            : answer(message, socket)), {}, { stored: { secret: newsecret() } });
    doc.getElementById("import").value = nsec(GRACE);
    doc.getElementById("use").click();
    await settled();
    doc.getElementById("import").value = nsec(ADA);
    doc.getElementById("use").click();
    await settled();
    for (const { message, socket } of held) answer(message, socket);
    await settled();
    assert.deepEqual(contents(doc), ["first"]);
});

// --- a signer extension -----------------------------------------------------

async function choosenip07(doc) {
    doc.getElementById("signing-nip07").checked = true;
    doc.getElementById("signing-nip07").onchange();
    await settled();
}

test("a signer extension signs once the reader allows page access",
    async () => {
        const stored = [];
        const { doc, chrome } = await open(PAGE, relay(stored), {},
            { nostr: nostrof(GRACE) });
        await choosenip07(doc);
        const who = pubkeyof(GRACE).slice(0, 8);
        assert.deepEqual(chrome.requested, [{ origins: ["<all_urls>"] }]);
        assert.equal(text(doc, "status"), "Signing with your signer extension.");
        assert.match(text(doc, "identity"), new RegExp(`You post as ${who}`));
        assert.equal(doc.getElementById("local-key").hidden, true);
        await write(doc, "signed elsewhere");
        assert.equal(stored[0].pubkey, pubkeyof(GRACE));
        assert.equal(chrome.scripting.calls.at(-1).target.tabId, 7);
        doc.getElementById("signing-local").checked = true;
        doc.getElementById("signing-local").onchange();
        await settled();
        assert.equal(text(doc, "status"), "Signing with boca's key.");
        assert.equal(doc.getElementById("local-key").hidden, false);
    });

test("without page access or a signer, boca keeps its own key",
    async () => {
        const denied = await open(PAGE, relay(), {},
            { nostr: nostrof(GRACE), grant: false });
        await choosenip07(denied.doc);
        assert.equal(text(denied.doc, "status"), "Still signing with boca's "
            + "key: boca needs access to web pages to reach your signer.");
        assert.equal(denied.doc.getElementById("signing-local").checked, true);
        const absent = await open(PAGE, relay());
        await choosenip07(absent.doc);
        assert.match(text(absent.doc, "status"),
            /no signer answered: no NIP-07 signer on this page\. Open a web/);
        assert.deepEqual(
            await absent.chrome.storage.local.get("signing"), {});
    });

test("a signer that refuses leaves the comment and the mute undone",
    async () => {
        const nostr = {
            ...nostrof(GRACE),
            signEvent: async () => { throw new Error("user declined"); }
        };
        const first = sign(ADA, comment(PAGE, "first", 100));
        const { doc } = await open(PAGE, relay([first]), {}, { nostr });
        await choosenip07(doc);
        await write(doc, "hello");
        assert.equal(text(doc, "status"),
            "Not posted: user declined. Your text is still here.");
        buttonnamed(doc, `Mute ${pubkeyof(ADA).slice(0, 8)}`).click();
        await settled();
        assert.equal(text(doc, "status"), "Nothing changed: user declined.");
        assert.deepEqual(contents(doc), ["first"]);
    });

// --- following the reader ---------------------------------------------------

test("the panel follows this window's active tab and page", async () => {
    const elsewhere = sign(ADA, comment(OTHER, "other", 100));
    const { doc, chrome } = await open(PAGE, relay([elsewhere]));
    const [activated] = chrome.listeners.activated;
    const [updated] = chrome.listeners.updated;
    chrome.tabs.url = OTHER;
    activated({ windowId: 2 });
    await settled();
    assert.equal(text(doc, "page"), PAGE);
    activated({ windowId: 1 });
    await settled();
    assert.deepEqual(contents(doc), ["other"]);
    updated(7, { status: "loading" }, { active: true, windowId: 1 });
    updated(7, { url: PAGE }, { active: false, windowId: 1 });
    updated(7, { url: PAGE }, { active: true, windowId: 2 });
    await settled();
    assert.equal(text(doc, "page"), OTHER);
    updated(7, { url: PAGE }, { active: true, windowId: 1 });
    await settled();
    assert.equal(text(doc, "page"), PAGE);
});

test("an answer for a page the reader has left is dropped", async () => {
    const held = [];
    const holding = (message, socket) => (message[2]["#I"]
        ? held.push({ message, socket })
        : relay()(message, socket));
    const { started, doc, chrome } = launch(PAGE, holding);
    await settled();
    const [updated] = chrome.listeners.updated;
    await updated(7, { url: "about:blank" }, { active: true, windowId: 1 });
    const late = sign(ADA, comment(PAGE, "late", 100));
    for (const { message, socket } of held) relay([late])(message, socket);
    await started;
    assert.equal(held.length, RELAYS.length);
    assert.deepEqual(contents(doc), []);
    assert.match(text(doc, "status"), /this tab is not one/);
});

test("a failure for a page the reader has left is dropped", async () => {
    const held = [];
    const { started, doc, chrome } = launch(PAGE, (message, socket) =>
        (message[2]["#I"] ? held.push(socket) : relay()(message, socket)));
    await settled();
    const [updated] = chrome.listeners.updated;
    await updated(7, { url: "about:blank" }, { active: true, windowId: 1 });
    for (const socket of held) socket.onerror();
    await started;
    assert.equal(held.length, RELAYS.length);
    assert.match(text(doc, "status"), /this tab is not one/);
});

// --- entry points -----------------------------------------------------------

test("the entry points start the panel and wire the toolbar button",
    async () => {
        const { document } = parseHTML(HTML.toString());
        const chrome = browser(PAGE);
        let behavior;
        chrome.sidePanel = { setPanelBehavior: (b) => (behavior = b) };
        const opened = [];
        const WebSocket = function (url) {
            opened.push(url);
            queueMicrotask(() => this.onerror());
            this.close = () => {};
        };
        Object.assign(globalThis, { document, chrome, WebSocket });
        await import("../src/background.js");
        assert.deepEqual(behavior, { openPanelOnActionClick: true });
        await import("../src/main.js");
        await settled();
        assert.deepEqual(new Set(opened), new Set(RELAYS));
        assert.match(document.getElementById("status").textContent,
            /no relay answered/);
    });
