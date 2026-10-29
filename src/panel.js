// The side panel: it shows the discussion for the page in this window's
// active tab, follows the reader to another tab or page, and posts what
// they write. The page's comments are asked for only while the panel
// shows that page.

import { commentable, pageof } from "./page.js";
import { comment, reply, sign, pubkeyof } from "./event.js";
import { fetchcomments, publish } from "./relay.js";
import { thread, count } from "./thread.js";
import { secretof, mutedof, mute, unmute } from "./store.js";
import { label, list, mutedlist } from "./view.js";

const RELAYS = [
    "wss://nos.lol",
    "wss://relay.primal.net",
    "wss://offchain.pub"
];

// --- the panel's state ------------------------------------------------------

function panel(env) {
    const doc = env.doc;
    const byid = (id) => doc.getElementById(id);
    return {
        env: env,
        area: env.chrome.storage.local,
        byid: byid,
        page: null,
        events: [],
        parent: null
    };
}

function say(p, text) {
    p.byid("status").textContent = text;
}

function unreached(failed) {
    return failed.length > 0 ? ` ${failed.join(", ")} did not answer.` : "";
}

function counted(n) {
    return n === 1 ? "1 comment." : `${n} comments.`;
}

// --- drawing ----------------------------------------------------------------

async function draw(p) {
    const muted = await mutedof(p.area);
    const roots = thread(p.page, muted, p.events);
    const actions = {
        reply: (event) => replyto(p, event),
        mute: (pubkey) => change(p, mute, pubkey)
    };
    p.byid("comments").replaceChildren(list(p.env.doc, roots, actions));
    const unmuting = (pubkey) => change(p, unmute, pubkey);
    p.byid("muted-list")
        .replaceChildren(mutedlist(p.env.doc, muted, unmuting));
    return count(roots);
}

async function change(p, how, pubkey) {
    await how(p.area, pubkey);
    await draw(p);
}

function replyto(p, event) {
    p.parent = event;
    p.byid("replying-to").textContent = `Replying to ${label(event.pubkey)}`;
    p.byid("replying").hidden = false;
    p.byid("text").focus();
}

function cancel(p) {
    p.parent = null;
    p.byid("replying").hidden = true;
}

// --- showing a page ---------------------------------------------------------

async function show(p, href) {
    cancel(p);
    p.byid("comments").replaceChildren();
    p.byid("compose").hidden = !commentable(href);
    if (!commentable(href)) return away(p);
    p.page = pageof(href);
    p.byid("page").textContent = p.page;
    say(p, "Asking the relays…");
    await load(p);
}

function away(p) {
    p.page = null;
    p.byid("page").textContent = "";
    say(p, "Boca comments on web pages, and this tab is not one.");
}

async function load(p) {
    const page = p.page;
    try {
        const { events, failed } = await fetchcomments(
            p.env.open, p.env.relays, page);
        if (p.page !== page) return;
        p.events = events;
        say(p, counted(await draw(p)) + unreached(failed));
    } catch (error) {
        if (p.page !== page) return;
        say(p, `Could not load comments: ${error.message}.`);
    }
}

// --- posting ----------------------------------------------------------------

function drafted(p, text) {
    const at = Math.floor(p.env.now() / 1000);
    return p.parent
        ? reply(p.page, p.parent, text, at)
        : comment(p.page, text, at);
}

async function post(p) {
    const text = p.byid("text").value.trim();
    if (text === "") return;
    const event = sign(await secretof(p.area), drafted(p, text));
    say(p, "Posting…");
    try {
        const { failed } = await publish(p.env.open, p.env.relays, event);
        p.events = [...p.events, event];
        p.byid("text").value = "";
        cancel(p);
        await draw(p);
        say(p, "Posted." + unreached(failed));
    } catch (error) {
        say(p, `Not posted: ${error.message}. Your text is still here.`);
    }
}

// --- wiring -----------------------------------------------------------------

async function current(p) {
    const tabs = p.env.chrome.tabs;
    const [tab] = await tabs.query({ active: true, currentWindow: true });
    return show(p, tab?.url ?? "");
}

async function identify(p) {
    const who = label(pubkeyof(await secretof(p.area)));
    p.byid("identity").textContent =
        `Comments are public and stay on the relays. You post as ${who}.`;
}

function listen(p, windowid) {
    const tabs = p.env.chrome.tabs;
    tabs.onActivated.addListener((info) => {
        if (info.windowId === windowid) current(p);
    });
    tabs.onUpdated.addListener((_, change, tab) => {
        if (tab.active && tab.windowId === windowid && change.url) {
            show(p, change.url);
        }
    });
}

async function start(env) {
    const p = panel({ relays: RELAYS, now: Date.now, ...env });
    p.byid("compose").onsubmit = (e) => {
        e.preventDefault();
        return post(p);
    };
    p.byid("cancel").onclick = () => cancel(p);
    const win = await env.chrome.windows.getCurrent();
    listen(p, win.id);
    await identify(p);
    await current(p);
    return p;
}

export { RELAYS, start };
