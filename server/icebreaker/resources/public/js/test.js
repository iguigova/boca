
// var wsUri = "wss://echo.websocket.org/";
var WS_URI = "localhost:3000/ws";
var output;

function init () {
    output = document.getElementById("output");
    testWebSocket();
}

function testWebSocket () {
    websocket = new WebSocket(WS_URI);
    websocket.onopen = function (e) { onOpen(e) };
    websocket.onclose = function (e) { onClose(e) };
    websocket.onmessage = function (e) { onMessage(e) };
    websocket.onerror = function (e) { onError(e) };
}

function onOpen (e) {
    writeToScreen("CONNECTED");
    doSend("WebSocket rocks");
}

function onClose (e) {
    writeToScreen("DISCONNECTED");
}

function onMessage (e) {
    writeToScreen('<span style="color: blue;">RESPONSE: ' + e.data+'</span>');
    websocket.close();
}

function onError (e) {
    writeToScreen('<span style="color: red;">ERROR:</span> ' + e.data);
}

function doSend (msg) {
    writeToScreen("SENT: " + msg);
    websocket.send(msg);
}

function writeToScreen (msg) {
    var pre = document.createElement("p");
    pre.style.wordWrap = "break-word";
    pre.innerHTML = message;
    output.appendChild(pre);
}

window.addEventListener("load", init, false);
