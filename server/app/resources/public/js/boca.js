import { App } from '/dist/app.js'
import { user, users, comments} from '/dist/data.js'
import { uuid } from '/dist/utils.js'

const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App uuid = {uuid} user = {user} users = {users} comments = {comments}/>);

