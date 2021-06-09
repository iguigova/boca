
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

function fetchStorageAccessKey(){
    // TODO: 
    return '77626b12-96e4-48ba-94738382ddd7-797e-4702';
}

function uploadPic(f){       
    console.log(f);

    const url = 'https://la.storage.bunnycdn.com//boca-uswest/images/' + f.name;        
    const options = {
        method: 'PUT',
        headers: {'Content-Type': 'application/octet-stream', 'AccessKey': fetchStorageAccessKey()},
        body: f  // https://stackoverflow.com/questions/36067767/how-do-i-upload-a-file-with-the-js-fetch-api
    };

    fetch(url, options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));

    return 'https://boca.b-cdn.net/images/' + f.name;
}

export { uuid, hash, cookie, uploadPic }
