// Turns what the relays returned into the page's discussion: each event is
// checked and kept once, muted authors are dropped, and replies sit under
// the comment they answer, oldest first. A reply whose parent is not here,
// muted or never returned, stands at the top.

import { COMMENT, valid } from "./event.js";

function tagged(event, name, value) {
    return event.tags.some(([n, v]) => n === name && v === value);
}

function belongs(page, event) {
    return event.kind === COMMENT && tagged(event, "I", page) && valid(event);
}

function parentof(event) {
    return event.tags.find(([name]) => name === "e")?.[1];
}

function oldest(a, b) {
    return a.event.created_at - b.event.created_at;
}

function nodes(page, muted, events) {
    const kept = events.filter(
        (e) => belongs(page, e) && !muted.has(e.pubkey));
    return new Map(kept.map((e) => [e.id, { event: e, replies: [] }]));
}

function thread(page, muted, events) {
    const byid = nodes(page, muted, events);
    const roots = [];
    for (const node of byid.values()) {
        const parent = byid.get(parentof(node.event));
        (parent ? parent.replies : roots).push(node);
    }
    for (const node of byid.values()) node.replies.sort(oldest);
    return roots.sort(oldest);
}

function count(nodes) {
    return nodes.reduce((n, node) => n + 1 + count(node.replies), 0);
}

export { thread, count };
