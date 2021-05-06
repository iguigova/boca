import { App } from '/dist/app.js'
import { uuid, users, comments} from '/dist/data.js'

ReactDOM.render(
  <App uuid = {uuid} users = {users} comments = {comments}/>,
  document.getElementById('root')
);

