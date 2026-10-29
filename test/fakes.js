// Stand-ins for the browser: a relay socket that answers from a script,
// and a chrome.storage area held in a Map.

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

export { relays, storagearea };
