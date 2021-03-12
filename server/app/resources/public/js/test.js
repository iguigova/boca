
var WS_URI = "ws://localhost:3000/ws";
var output, websocket;

var init = () => {

    output = document.getElementById("output");

    websocket = new WebSocket(WS_URI);
    websocket.onopen = onOpen;
    websocket.onclose = onClose;
    websocket.onmessage = onMessage;
    websocket.onerror = onError;
    
};

var onOpen = (e) => {
    writeToScreen("CONNECTED");
    send("WebSocket rocks");
};

var onClose = (e) => {
    writeToScreen("DISCONNECTED");
};

var onMessage = (e) => {
    writeToScreen('<span style="color: blue;">RESPONSE: ' + e.data+'</span>');
    websocket.close();
};

var onError = (e) => {
    writeToScreen('<span style="color: red;">ERROR:</span> ' + e.data);
};

var send = (msg) => {
    writeToScreen("SENT: " + msg);
    websocket.send(msg);
};

var writeToScreen = (msg) => {
    var pre = document.createElement("p");
    pre.style.wordWrap = "break-word";
    pre.innerHTML = msg;
    output.appendChild(pre);
};

window.addEventListener("load", init, false);
