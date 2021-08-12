var websocket;

var createSocket = () => {
    websocket = new WebSocket(((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host + "/ws");
    websocket.onopen = onOpen;
    websocket.onclose = onClose;
    websocket.onmessage = onMessage;
    websocket.onerror = onError;

    return websocket;
};

var onOpen = (e) => {
    console.log("CONNECTED");
    //console.log(e);
};

var onClose = (e) => {
    console.log("DISCONNECTED");
    //console.log(e);
    websocket = null;
};

var onMessage = (e) => {
    //console.log(e);
    log(e.data);
};

var onError = (e) => {
    console.log(e);
};

var log = (msg) => {
    console.log(msg);
};

var telegraph = (msg, process) => {
    log = process || log;   
    (websocket || createSocket()).send(JSON.stringify(msg));
};

export { telegraph }
