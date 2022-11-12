var websocket;

var createSocket = (timeout) => {
    websocket = new WebSocket(((window.location.protocol === "https:") ? "wss://" : "ws://") + window.location.host + "/ws?pathname=" + window.location.pathname);
    websocket.onopen = onOpen;
    websocket.onclose = onClose;
    websocket.onmessage = onMessage;
    websocket.onerror = onError;

    //return websocket;
    return new Promise(resolve => { setTimeout(function() { resolve(websocket) }, timeout || 1000); }); 
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

var telegraph = async (msg, process) => {
    log = process || log;   
    (websocket || await createSocket()).send(JSON.stringify(msg));
};

export { telegraph }
