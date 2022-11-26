import { uuid, hash, cookie } from '/dist/utils.js'

function user(){
    var id = uuid();
    return cookie("user", { name: id, avatarUrl: "https://picsum.photos/id/" + hash(id, 1084)  + "/24" });
}

const users = [ {name: uuid(), avatarUrl: "https://picsum.photos/id/551/24"},
                {name: uuid(), avatarUrl: "https://picsum.photos/id/552/24"}];

const comments = [{uuid: uuid(), timestamp: new Date(), text: "Hello there", author: users[0]},
                  {uuid: uuid(), timestamp: new Date(), text: "Are you looking for me?", author: users[1]},
                  {uuid: uuid(), timestamp: new Date(), text: "https://img.theculturetrip.com/1440x807/smart/wp-content/uploads/2020/08/grny4f-e1598389168207.jpg https://img.theculturetrip.com/768x/smart/wp-content/uploads/2020/08/e1txnm.jpg", author: users[0]}
                 ];


export { user, users, comments }
