import { schnorr } from "@noble/curves/secp256k1.js";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex, hexToBytes, utf8ToBytes } from "@noble/hashes/utils.js";

// A comment is a NIP-22 event of kind 1111. Its root is the page, an I tag
// of kind "web"; its parent is the page again, or the comment it answers.
// The id and signature are NIP-01's: a sha256 of the serialized event,
// signed with BIP-340 Schnorr over secp256k1.

const COMMENT = 1111;
const HEX64 = /^[0-9a-f]{64}$/;
const HEX128 = /^[0-9a-f]{128}$/;

// --- tags -------------------------------------------------------------------

function roottags(page) {
    return [["I", page], ["K", "web"]];
}

function pagetags(page) {
    return [...roottags(page), ["i", page], ["k", "web"]];
}

function replytags(page, parent) {
    const answers = [
        ["e", parent.id, "", parent.pubkey],
        ["k", String(COMMENT)],
        ["p", parent.pubkey]
    ];
    return [...roottags(page), ...answers];
}

// --- drafts -----------------------------------------------------------------

function draft(tags, content, at) {
    return { kind: COMMENT, created_at: at, tags: tags, content: content };
}

function comment(page, content, at) {
    return draft(pagetags(page), content, at);
}

function reply(page, parent, content, at) {
    return draft(replytags(page, parent), content, at);
}

// --- signing ----------------------------------------------------------------

function serialize(event) {
    const { pubkey, created_at, kind, tags, content } = event;
    return JSON.stringify([0, pubkey, created_at, kind, tags, content]);
}

function idof(event) {
    return bytesToHex(sha256(utf8ToBytes(serialize(event))));
}

function pubkeyof(secret) {
    return bytesToHex(schnorr.getPublicKey(hexToBytes(secret)));
}

function sign(secret, unsigned) {
    const event = { ...unsigned, pubkey: pubkeyof(secret) };
    const id = idof(event);
    const sig = schnorr.sign(hexToBytes(id), hexToBytes(secret));
    return { ...event, id: id, sig: bytesToHex(sig) };
}

function newsecret() {
    return bytesToHex(schnorr.utils.randomSecretKey());
}

// --- checking ---------------------------------------------------------------

// Events come from relays nobody vouches for, so a malformed one is an
// invalid one: the shape is checked before any byte reaches the curve.
function wellformed(event) {
    return HEX64.test(event?.id) && HEX64.test(event.pubkey)
        && HEX128.test(event.sig) && Array.isArray(event.tags)
        && typeof event.content === "string"
        && Number.isInteger(event.created_at);
}

function signed(event) {
    const [sig, id, pubkey] = [event.sig, event.id, event.pubkey]
        .map(hexToBytes);
    return idof(event) === event.id && schnorr.verify(sig, id, pubkey);
}

function valid(event) {
    return wellformed(event) && signed(event);
}

export { COMMENT, comment, reply, sign, newsecret, pubkeyof, valid };
