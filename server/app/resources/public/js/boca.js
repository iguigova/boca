import { App } from '/dist/app.js'
import { user, users, comments} from '/dist/data.js'
import { uuid } from '/dist/utils.js'

// https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#updates-to-client-rendering-apis
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container);
root.render(<App uuid = {uuid} user = {user} users = {users} comments = {comments}/>);

