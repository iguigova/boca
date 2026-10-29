// A page is named the way NIP-73 names a web page: its URL, normalized,
// with no fragment. Only http and https pages are ones another reader can
// open, so only they carry comments.

const WEB = new Set(["http:", "https:"]);

function commentable(href) {
    return URL.canParse(href) && WEB.has(new URL(href).protocol);
}

function pageof(href) {
    if (!commentable(href)) throw new Error(`not a web page: ${href}`);
    const url = new URL(href);
    url.hash = "";
    return url.href;
}

export { commentable, pageof };
