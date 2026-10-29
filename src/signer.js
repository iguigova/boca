// Two ways to sign. The local signer uses the key boca keeps. The NIP-07
// signer uses an extension the reader already has, which offers
// window.nostr to web pages only, so boca asks for it through the page in
// the active tab. Whatever a page hands back is checked before it is used.

import { sign, pubkeyof, valid } from "./event.js";
import { secretof } from "./store.js";

const HEX64 = /^[0-9a-f]{64}$/;

function localsigner(area) {
    return {
        pubkey: async () => pubkeyof(await secretof(area)),
        sign: async (unsigned) => sign(await secretof(area), unsigned)
    };
}

// --- through the page -------------------------------------------------------

// Runs in the page, so it uses nothing from outside its own body.
async function asksigner(method, event) {
    if (!window.nostr) return { error: "no NIP-07 signer on this page" };
    try {
        const value = method === "pubkey"
            ? await window.nostr.getPublicKey()
            : await window.nostr.signEvent(event);
        return { value: value };
    } catch (error) {
        return { error: String(error?.message ?? error) };
    }
}

async function ask(scripting, tabid, method, event = null) {
    const [{ result }] = await scripting.executeScript({
        target: { tabId: tabid },
        world: "MAIN",
        func: asksigner,
        args: [method, event]
    });
    if (result.error) throw new Error(result.error);
    return result.value;
}

async function signerpubkey(scripting, tabid) {
    const pubkey = await ask(scripting, tabid, "pubkey");
    if (!HEX64.test(pubkey)) throw new Error("the signer gave no public key");
    return pubkey;
}

function checked(pubkey, event) {
    if (valid(event) && event.pubkey === pubkey) return event;
    throw new Error("the signer returned an event that does not check out");
}

// tabof answers the id of the tab whose page is asked.
function nip07signer(scripting, tabof, pubkey) {
    return {
        pubkey: async () => pubkey,
        sign: async (unsigned) =>
            checked(pubkey, await ask(scripting, tabof(), "sign", unsigned))
    };
}

export { localsigner, nip07signer, signerpubkey, asksigner };
