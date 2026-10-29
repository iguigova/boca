// The panel's one status line, announced to screen readers as it changes.

function say(p, text) {
    p.byid("status").textContent = text;
}

function unreached(failed) {
    return failed.length > 0 ? ` ${failed.join(", ")} did not answer.` : "";
}

export { say, unreached };
