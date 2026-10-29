import { start } from "./panel.js";

start({
    doc: document,
    chrome: chrome,
    open: (url) => new WebSocket(url)
});
