// The reader's mute list is NIP-51's: a replaceable event of kind 10000
// whose p tags are the muted authors. Other clients put hashtags, words,
// threads and encrypted items in the same list, so a change keeps every
// tag and the content it did not touch.

import { valid } from "./event.js";

const MUTELIST = 10000;

function mutedin(list) {
    const tags = list?.tags ?? [];
    return new Set(tags.filter(([n]) => n === "p").map(([, v]) => v));
}

function others(list, pubkey) {
    const tags = list?.tags ?? [];
    return tags.filter(([n, v]) => !(n === "p" && v === pubkey));
}

// A replaceable event replaces only an older one, so the new list is
// dated after the list it replaces even when the clock says otherwise.
function successor(list, tags, at) {
    const after = list ? Math.max(at, list.created_at + 1) : at;
    const content = list?.content ?? "";
    return { kind: MUTELIST, created_at: after, tags: tags, content: content };
}

function withmute(list, pubkey, at) {
    return successor(list, [...others(list, pubkey), ["p", pubkey]], at);
}

function withoutmute(list, pubkey, at) {
    return successor(list, others(list, pubkey), at);
}

function newest(pubkey, lists) {
    const mine = lists.filter((e) =>
        e?.kind === MUTELIST && e.pubkey === pubkey && valid(e));
    return mine.reduce(
        (a, b) => (!a || b.created_at > a.created_at ? b : a), undefined);
}

export { MUTELIST, mutedin, withmute, withoutmute, newest };
