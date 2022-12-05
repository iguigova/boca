import { uuid, hash, cookie } from '/dist/utils.js'

function user(){
    var id = uuid();
    return cookie("user", { name: id, avatarUrl: "https://picsum.photos/id/" + hash(id, 1084)  + "/24" });
}

const users = [];
const comments = [];

export { user, users, comments }
