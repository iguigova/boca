// The side panel: it shows the discussion for the page in this window's
// active tab, follows the reader to another tab or page, and posts what
// they write. The page's comments are asked for only while the panel
// shows that page.

import { commentable, pageof } from "./page.js";
import { comment, reply } from "./event.js";
import { fetchcomments, publish } from "./relay.js";
import { thread, count } from "./thread.js";
import { mutedin, withmute, withoutmute } from "./mutes.js";
import { identify, syncmutes, changemute, wireaccount } from "./account.js";
import { say, unreached } from "./status.js";
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
    const p = {
        env: env,
        area: env.chrome.storage.local,
        byid: byid,
        tabid: undefined,
        page: null,
        events: [],
        parent: null,
        signer: null,
        me: null,
        mutelist: undefined
    };
    p.draw = () => draw(p);
    return p;
}

function counted(n) {
    return n === 1 ? "1 comment." : `${n} comments.`;
}

// --- drawing ----------------------------------------------------------------

function draw(p) {
    const muted = mutedin(p.mutelist);
    const roots = thread(p.page, muted, p.events);
    const actions = {
        reply: (event) => replyto(p, event),
        mute: (pubkey) =>
            changemute(p, withmute, pubkey, `Muted ${label(pubkey)}`)
    };
    p.byid("comments").replaceChildren(list(p.env.doc, roots, actions));
    const unmuting = (pubkey) =>
        changemute(p, withoutmute, pubkey, `Unmuted ${label(pubkey)}`);
    p.byid("muted-list")
        .replaceChildren(mutedlist(p.env.doc, muted, unmuting));
    return count(roots);
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
        say(p, counted(draw(p)) + unreached(failed));
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
    say(p, "Posting…");
    try {
        const event = await p.signer.sign(drafted(p, text));
        const { failed } = await publish(p.env.open, p.env.relays, event);
        p.events = [...p.events, event];
        p.byid("text").value = "";
        cancel(p);
        draw(p);
        say(p, "Posted." + unreached(failed));
    } catch (error) {
        say(p, `Not posted: ${error.message}. Your text is still here.`);
    }
}

// --- wiring -----------------------------------------------------------------

async function current(p) {
    const tabs = p.env.chrome.tabs;
    const [tab] = await tabs.query({ active: true, currentWindow: true });
    p.tabid = tab?.id;
    return show(p, tab?.url ?? "");
}

function listen(p, windowid) {
    const tabs = p.env.chrome.tabs;
    tabs.onActivated.addListener((info) => {
        if (info.windowId === windowid) current(p);
    });
    tabs.onUpdated.addListener((_, change, tab) => {
        if (tab.active && tab.windowId === windowid && change.url) {
            p.tabid = tab.id;
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
    wireaccount(p);
    const win = await env.chrome.windows.getCurrent();
    listen(p, win.id);
    await identify(p);
    await current(p);
    await syncmutes(p);
    return p;
}

export { RELAYS, start };
