// Talks NIP-01 to public relays, one short-lived socket per relay and
// request: a page's comments are asked for when its panel shows the page,
// and the socket closes at the relay's end of stored events. open makes the
// socket, so a test can hand in its own. A settled socket is silenced
// before it closes, because closing one that has not opened fires its
// error handler.

import { COMMENT } from "./event.js";

const TIMEOUT = 8000;
const SUBSCRIPTION = "boca";

// --- one relay --------------------------------------------------------------

function exchange(open, relay, message, settle) {
    return new Promise((resolve, reject) => {
        const socket = open(relay);
        const timer = setTimeout(() => fail(new Error("no answer")), TIMEOUT);
        const end = (finish) => (value) => {
            clearTimeout(timer);
            socket.onerror = socket.onmessage = null;
            socket.close();
            finish(value);
        };
        const done = { resolve: end(resolve), reject: end(reject) };
        const fail = done.reject;
        socket.onopen = () => socket.send(JSON.stringify(message));
        socket.onerror = () => fail(new Error("connection failed"));
        socket.onmessage = (m) => read(m.data, settle, done);
    });
}

function read(data, settle, done) {
    try {
        settle(JSON.parse(data), done);
    } catch (error) {
        done.reject(error);
    }
}

function collect(events) {
    return ([type, , payload], done) => {
        if (type === "EVENT") events.push(payload);
        if (type === "EOSE") done.resolve(events);
        if (type === "CLOSED") done.reject(new Error(payload));
    };
}

function acknowledge(id) {
    return ([type, event, accepted, reason], done) => {
        if (type !== "OK" || event !== id) return;
        if (accepted) done.resolve(reason);
        else done.reject(new Error(reason));
    };
}

function query(open, filter, relay) {
    const message = ["REQ", SUBSCRIPTION, filter];
    return exchange(open, relay, message, collect([]));
}

function send(open, event, relay) {
    return exchange(open, relay, ["EVENT", event], acknowledge(event.id));
}

// --- every relay ------------------------------------------------------------

// Each relay answers on its own; the call fails only when none of them did,
// so an empty page is told apart from a page nobody could be asked about.
async function ask(relays, call) {
    const results = await Promise.allSettled(relays.map(call));
    const answered = results.filter((r) => r.status === "fulfilled");
    const failed = relays.filter((_, i) => results[i].status === "rejected");
    if (answered.length === 0) throw new Error("no relay answered");
    return { values: answered.map((r) => r.value), failed: failed };
}

async function fetchevents(open, relays, filter) {
    const { values, failed } = await ask(relays, (r) => query(open, filter, r));
    return { events: values.flat(), failed: failed };
}

function fetchcomments(open, relays, page) {
    return fetchevents(open, relays, { kinds: [COMMENT], "#I": [page] });
}

async function publish(open, relays, event) {
    const { failed } = await ask(relays, (r) => send(open, event, r));
    return { failed: failed };
}

export { TIMEOUT, fetchevents, fetchcomments, publish };
