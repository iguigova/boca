// The reader's side of the panel: who signs, the key they can back up or
// replace, and the mute list that follows them between devices on the
// relays. p is the panel's state; p.draw redraws the discussion.

import { MUTELIST, newest } from "./mutes.js";
import { npub, nsec, secretfrom } from "./keys.js";
import { fetchevents, publish } from "./relay.js";
import { localsigner, nip07signer, signerpubkey } from "./signer.js";
import {
    secretof, setsecret, signingof, setsigning, mutelistof, setmutelist
} from "./store.js";
import { say, unreached } from "./status.js";
import { label } from "./view.js";

const ALLSITES = { origins: ["<all_urls>"] };

// --- who signs --------------------------------------------------------------

function signerfor(p, signing) {
    if (signing.by !== "nip07") return localsigner(p.area);
    const scripting = p.env.chrome.scripting;
    return nip07signer(scripting, () => p.tabid, signing.pubkey);
}

async function identify(p) {
    const signing = await signingof(p.area);
    p.signer = signerfor(p, signing);
    p.me = await p.signer.pubkey();
    p.mutelist = await mutelistof(p.area, p.me);
    p.byid("identity").textContent = "Comments are public and stay on "
        + `the relays. You post as ${label(p.me)}.`;
    p.byid("npub").value = npub(p.me);
    p.byid(`signing-${signing.by}`).checked = true;
    p.byid("local-key").hidden = signing.by !== "local";
    p.byid("nsec").hidden = true;
}

async function reidentify(p) {
    await identify(p);
    p.draw();
    await syncmutes(p);
}

// --- the signer extension ---------------------------------------------------

// The permission request comes first, while the click still counts as the
// reader's gesture; Chrome refuses it after an await.
async function usenip07(p) {
    const granted = await p.env.chrome.permissions.request(ALLSITES);
    if (!granted) return refuse(p, "boca needs access to web pages to "
        + "reach your signer");
    try {
        const scripting = p.env.chrome.scripting;
        const pubkey = await signerpubkey(scripting, p.tabid);
        await setsigning(p.area, { by: "nip07", pubkey: pubkey });
    } catch (error) {
        return refuse(p, `no signer answered: ${error.message}. Open a web `
            + "page where your signer works and try again");
    }
    await reidentify(p);
    say(p, "Signing with your signer extension.");
}

function refuse(p, reason) {
    p.byid("signing-local").checked = true;
    say(p, `Still signing with boca's key: ${reason}.`);
}

async function uselocal(p) {
    await setsigning(p.area, { by: "local" });
    await reidentify(p);
    say(p, "Signing with boca's key.");
}

// --- the key ----------------------------------------------------------------

async function reveal(p) {
    const field = p.byid("nsec");
    field.value = nsec(await secretof(p.area));
    field.hidden = false;
    field.select();
}

async function replacekey(p) {
    const field = p.byid("import");
    let secret;
    try {
        secret = secretfrom(field.value);
    } catch (error) {
        field.setAttribute("aria-invalid", "true");
        p.byid("import-error").textContent =
            `That is not a secret key (${error.message}). Paste an nsec `
            + "or 64 hex digits.";
        return;
    }
    await setsecret(p.area, secret);
    field.value = "";
    field.removeAttribute("aria-invalid");
    p.byid("import-error").textContent = "";
    await reidentify(p);
    say(p, `Now posting as ${label(p.me)}.`);
}

// --- the mute list ----------------------------------------------------------

// The relays' newest list replaces the one kept here when it is newer; a
// relay that does not answer leaves the kept list as it is.
async function syncmutes(p) {
    const filter = { kinds: [MUTELIST], authors: [p.me] };
    const me = p.me;
    const { events } = await fetchevents(p.env.open, p.env.relays, filter)
        .catch(() => ({ events: [] }));
    if (p.me !== me) return;
    const latest = newest(me, [...events, p.mutelist]);
    if (latest === p.mutelist) return;
    p.mutelist = latest;
    await setmutelist(p.area, latest);
    p.draw();
}

async function changemute(p, how, pubkey, done) {
    const at = Math.floor(p.env.now() / 1000);
    let list;
    try {
        list = await p.signer.sign(how(p.mutelist, pubkey, at));
    } catch (error) {
        return say(p, `Nothing changed: ${error.message}.`);
    }
    p.mutelist = list;
    await setmutelist(p.area, list);
    p.draw();
    await share(p, list, done);
}

async function share(p, list, done) {
    try {
        const { failed } = await publish(p.env.open, p.env.relays, list);
        say(p, `${done}.${unreached(failed)}`);
    } catch (error) {
        say(p, `${done} here, but no relay took your mute list: `
            + `${error.message}.`);
    }
}

// --- wiring -----------------------------------------------------------------

function wireaccount(p) {
    p.byid("signing-local").onchange = () => uselocal(p);
    p.byid("signing-nip07").onchange = () => usenip07(p);
    p.byid("reveal").onclick = () => reveal(p);
    p.byid("use").onclick = () => replacekey(p);
}

export { identify, syncmutes, changemute, wireaccount };
