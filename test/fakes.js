// Stand-ins for the browser: a relay socket that answers from a script,
// a chrome.storage area held in a Map, and a page whose NIP-07 signer is
// reached the way chrome.scripting reaches it.

import { sign, pubkeyof } from "../src/event.js";

// answer(message, socket) is called with each message the client sends.
// A relay named in refuse errors instead of opening, one in silent never
// answers at all, and closing any socket fires its error handler, as a
// browser does for a socket closed before it opened.
function relays(answer, { refuse = [], silent = [] } = {}) {
    const sent = [];
    const open = (url) => {
        const socket = {
            url: url,
            closed: false,
            send: (data) => {
                const message = JSON.parse(data);
                sent.push({ url: url, message: message });
                answer(message, socket);
            },
            reply: (message) => socket.onmessage({ data: message }),
            close: () => {
                socket.closed = true;
                socket.onerror?.(new Event("error"));
            }
        };
        queueMicrotask(() => {
            if (refuse.includes(url)) socket.onerror(new Event("error"));
            else if (!silent.includes(url)) socket.onopen();
        });
        return socket;
    };
    return { open: open, sent: sent };
}

function storagearea(initial = {}) {
    const data = new Map(Object.entries(initial));
    return {
        data: data,
        get: async (key) => (data.has(key) ? { [key]: data.get(key) } : {}),
        set: async (items) => {
            for (const [k, v] of Object.entries(items)) data.set(k, v);
        }
    };
}

// The injected function runs with its arguments in a page whose
// window.nostr is the given signer, or which has none.
function scriptingwith(nostr) {
    return {
        calls: [],
        executeScript: async function (injection) {
            this.calls.push(injection);
            globalThis.window = nostr === undefined ? {} : { nostr: nostr };
            const result = await injection.func(...injection.args);
            delete globalThis.window;
            return [{ result: result }];
        }
    };
}

function nostrof(secret) {
    return {
        getPublicKey: async () => pubkeyof(secret),
        signEvent: async (unsigned) => sign(secret, unsigned)
    };
}

export { relays, storagearea, scriptingwith, nostrof };
