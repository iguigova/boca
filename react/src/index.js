import { App } from '/dist/app.js'
import { user, users, comments} from '/dist/data.js'
import { uuid } from '/dist/utils.js'

ReactDOM.render(
    <App uuid = {uuid} user = {user} users = {users} comments = {comments}/>,
    document.getElementById('root')
);

