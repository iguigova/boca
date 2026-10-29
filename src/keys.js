// Keys as people copy them: NIP-19's bech32 nsec and npub. Inside events
// and storage a key stays hex.

import { bech32 } from "@scure/base";
import { bytesToHex, hexToBytes } from "@noble/hashes/utils.js";
import { pubkeyof } from "./event.js";

const HEX64 = /^[0-9a-f]{64}$/;

function encode(prefix, hex) {
    return bech32.encode(prefix, bech32.toWords(hexToBytes(hex)));
}

function npub(pubkey) {
    return encode("npub", pubkey);
}

function nsec(secret) {
    return encode("nsec", secret);
}

function fromnsec(text) {
    const { prefix, words } = bech32.decode(text);
    if (prefix !== "nsec") throw new Error(`an ${prefix} is not a secret key`);
    return bytesToHex(bech32.fromWords(words));
}

// Takes an nsec or 64 hex digits, and refuses anything that is not a key
// the curve accepts.
function secretfrom(text) {
    const typed = text.trim().toLowerCase();
    const secret = HEX64.test(typed) ? typed : fromnsec(typed);
    pubkeyof(secret);
    return secret;
}

export { npub, nsec, secretfrom };
