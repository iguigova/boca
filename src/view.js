// Draws the discussion as nested lists. Comment text is plain text by
// NIP-22, so it is set as text and never parsed as markup.

const SHORT = 8;

function label(pubkey) {
    return pubkey.slice(0, SHORT);
}

function element(doc, tag, props = {}, children = []) {
    const node = Object.assign(doc.createElement(tag), props);
    node.append(...children);
    return node;
}

function stamp(doc, seconds) {
    const date = new Date(seconds * 1000);
    const text = date.toLocaleString();
    return element(doc, "time", { dateTime: date.toISOString() }, [text]);
}

function button(doc, text, onclick) {
    return element(doc, "button", { type: "button", onclick: onclick }, [text]);
}

function controls(doc, event, actions) {
    const who = label(event.pubkey);
    return element(doc, "div", { className: "controls" }, [
        button(doc, `Reply to ${who}`, () => actions.reply(event)),
        button(doc, `Mute ${who}`, () => actions.mute(event.pubkey))
    ]);
}

function article(doc, event, actions) {
    const header = element(doc, "header", {}, [
        element(doc, "span", { className: "author" }, [label(event.pubkey)]),
        " · ",
        stamp(doc, event.created_at)
    ]);
    const text = element(doc, "p", { className: "text" }, [event.content]);
    return element(doc, "article", {}, [
        header, text, controls(doc, event, actions)
    ]);
}

function item(doc, node, actions) {
    const replies = node.replies.length > 0
        ? [list(doc, node.replies, actions)]
        : [];
    return element(doc, "li", {}, [
        article(doc, node.event, actions), ...replies
    ]);
}

function list(doc, nodes, actions) {
    return element(doc, "ol", {}, nodes.map((n) => item(doc, n, actions)));
}

function mutedlist(doc, muted, unmute) {
    const entry = (pubkey) => element(doc, "li", {}, [
        label(pubkey), " ",
        button(doc, `Unmute ${label(pubkey)}`, () => unmute(pubkey))
    ]);
    return element(doc, "ul", {}, [...muted].map(entry));
}

export { label, list, mutedlist };
