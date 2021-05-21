import { App } from '/dist/app.js'
import { uuid, user, users, comments} from '/dist/data.js'

ReactDOM.render(
    <App uuid = {uuid} user = {user} users = {users} comments = {comments}/>,
    document.getElementById('root')
);

