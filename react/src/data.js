
// https://www.w3resource.com/javascript-exercises/javascript-math-exercise-23.php
function uuid(){
    var dt = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (dt + Math.random()*16)%16 | 0;
        dt = Math.floor(dt/16);
        return (c=='x' ? r :(r&0x3|0x8)).toString(16);
    });
    return uuid;
}

const INIT_NUMBER = 271; // https://stackoverflow.com/questions/59686036/generate-consistent-hash-of-a-uuid

function hash(uuid, N) {
    const x = Math.abs(uuid.split("-").reduce((a,b) => a ^ Number.parseInt(b, 16), INIT_NUMBER));
    return arguments.length === 1 ? x : x % N;
}

function cookie(name, value){
    var cookies = document.cookie;
    
    var cookie; 
    if (cookies)
    {
        cookie = cookies.split(';').find(c => c.trim().startsWith(name + '=')).split('=')[1];
    }
    
    if (!cookie){
        cookie = JSON.stringify(value);
        document.cookie = name + '=' + cookie + ';expires=' + new Date(2147483647 * 1000).toUTCString() + ';path=/';
    }

    return JSON.parse(cookie);
}

function user(){
    var id = uuid();
    return cookie("user", { name: id, avatarUrl: "https://picsum.photos/id/" + hash(id, 1084)  + "/20" });
}

const users = [ {name: uuid(), avatarUrl: "https://picsum.photos/id/551/20"},
                {name: uuid(), avatarUrl: "https://picsum.photos/id/552/20"}];

const comments = [{uuid: uuid(), timestamp: new Date(), text: "Hello there", author: users[0]},
                  {uuid: uuid(), timestamp: new Date(), text: "Are you looking for me?", author: users[1]}];


export { uuid, user, users, comments }
