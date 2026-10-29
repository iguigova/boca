import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { parseHTML } from "linkedom";

import { start, RELAYS } from "../src/panel.js";
import { comment, sign, newsecret, pubkeyof } from "../src/event.js";
import { relays, storagearea } from "./fakes.js";

const HTML = readFileSync(new URL("../static/panel.html", import.meta.url));
const PAGE = "https://example.com/post";
const OTHER = "https://example.org/";
const ADA = newsecret();

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
            const page = filter["#I"][0];
            const rooted = (e) => e.tags.some(([n, v]) => n === "I" && v === page);
            for (const e of stored.filter(rooted)) {
                socket.reply(JSON.stringify(["EVENT", subscription, e]));
            }
            socket.reply(JSON.stringify(["EOSE", subscription]));
        }
    };
}

function browser(url) {
    const listeners = { activated: [], updated: [] };
    const tabs = {
        url: url,
        query: async () => (tabs.url === undefined ? [] : [{ url: tabs.url }]),
        onActivated: { addListener: (f) => listeners.activated.push(f) },
        onUpdated: { addListener: (f) => listeners.updated.push(f) }
    };
    return {
        storage: { local: storagearea() },
        windows: { getCurrent: async () => ({ id: 1 }) },
        tabs: tabs,
        listeners: listeners
    };
}

async function settled() {
    for (let i = 0; i < 5; i++) await new Promise((r) => setTimeout(r, 0));
}

// launch hands back the panel before its first page has loaded; open
// waits for that load.
function launch(url, answer, options) {
    const { document } = parseHTML(HTML.toString());
    const chrome = browser(url);
    const fake = relays(answer, options);
    const started = start({ doc: document, chrome: chrome, open: fake.open });
    return { started: started, doc: document, chrome: chrome, fake: fake };
}

async function open(url, answer, options) {
    const launched = launch(url, answer, options);
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
    assert.deepEqual(fake.sent.map((s) => s.url), RELAYS);
    assert.match(text(doc, "identity"), /public.*You post as [0-9a-f]{8}\./);
    assert.equal(doc.querySelector("time").getAttribute("datetime"),
        "1970-01-01T00:01:40.000Z");
});

test("a tab that is not a web page asks nothing", async () => {
    for (const url of ["chrome://extensions/", undefined]) {
        const { doc, fake } = await open(url, relay());
        assert.match(text(doc, "status"), /this tab is not one/);
        assert.equal(doc.getElementById("compose").hidden, true);
        assert.equal(fake.sent.length, 0);
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

test("muting hides an author until they are unmuted", async () => {
    const first = sign(ADA, comment(PAGE, "first", 100));
    const { doc } = await open(PAGE, relay([first]));
    const who = pubkeyof(ADA).slice(0, 8);
    buttonnamed(doc, `Mute ${who}`).click();
    await settled();
    assert.deepEqual(contents(doc), []);
    buttonnamed(doc, `Unmute ${who}`).click();
    await settled();
    assert.deepEqual(contents(doc), ["first"]);
    assert.equal(buttonnamed(doc, `Unmute ${who}`), undefined);
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
    const holding = (message, socket) => held.push({ message, socket });
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
    const { started, doc, chrome } = launch(PAGE, (_, s) => held.push(s));
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
        assert.deepEqual(opened, RELAYS);
        assert.match(document.getElementById("status").textContent,
            /no relay answered/);
    });
