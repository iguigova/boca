// What boca keeps on this computer, in the extension's local storage: the
// reader's secret key, made the first time it is needed, and the authors
// they muted. area is a chrome.storage area.

import { newsecret } from "./event.js";

async function secretof(area) {
    const { secret } = await area.get("secret");
    if (secret) return secret;
    const made = newsecret();
    await area.set({ secret: made });
    return made;
}

async function mutedof(area) {
    const { muted } = await area.get("muted");
    return new Set(muted ?? []);
}

async function mute(area, pubkey) {
    const muted = await mutedof(area);
    await area.set({ muted: [...muted.add(pubkey)] });
}

async function unmute(area, pubkey) {
    const muted = await mutedof(area);
    muted.delete(pubkey);
    await area.set({ muted: [...muted] });
}

export { secretof, mutedof, mute, unmute };
