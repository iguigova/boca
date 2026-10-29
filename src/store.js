// What boca keeps on this computer, in the extension's local storage: the
// secret key, made the first time it is needed; how the reader signs; and
// the newest mute list it has seen. area is a chrome.storage area.

import { newsecret } from "./event.js";

const LOCAL = { by: "local" };

async function read(area, key) {
    return (await area.get(key))[key];
}

async function secretof(area) {
    const secret = await read(area, "secret");
    if (secret) return secret;
    const made = newsecret();
    await area.set({ secret: made });
    return made;
}

async function setsecret(area, secret) {
    await area.set({ secret: secret });
}

// { by: "local" }, or { by: "nip07", pubkey } for a signer extension.
async function signingof(area) {
    return (await read(area, "signing")) ?? LOCAL;
}

async function setsigning(area, signing) {
    await area.set({ signing: signing });
}

// The list kept is one author's; another author has none here yet.
async function mutelistof(area, pubkey) {
    const list = await read(area, "mutelist");
    return list?.pubkey === pubkey ? list : undefined;
}

async function setmutelist(area, list) {
    await area.set({ mutelist: list });
}

export {
    secretof, setsecret, signingof, setsigning, mutelistof, setmutelist
};
