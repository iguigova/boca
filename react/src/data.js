import { uuid, hash, cookie } from '/dist/utils.js'

function user(){
    var id = uuid();
    return cookie("user", { name: id, avatarUrl: "https://picsum.photos/id/" + hash(id, 1084)  + "/20" });
}

const users = [ {name: uuid(), avatarUrl: "https://picsum.photos/id/551/20"},
                {name: uuid(), avatarUrl: "https://picsum.photos/id/552/20"}];

const comments = [{uuid: uuid(), timestamp: new Date(), text: "Hello there", author: users[0]},
                  {uuid: uuid(), timestamp: new Date(), text: "Are you looking for me?", author: users[1]},
                  {uuid: uuid(), timestamp: new Date(), text: "https://www-1565g.bookeo.com/bookeo/cfile/415659FAAEL15FAD93BB55/1561140871799_3UCE3MT797A949W7Y9XAXL4JH9ULEU67_1000_666.jpg https://www.stopmotioncentral.com/wp-content/uploads/2018/10/Will-Vinton-Dies-at-Age-70-4thOct2018-302x180.jpg", author: users[0]}
                 ];


export { user, users, comments }
