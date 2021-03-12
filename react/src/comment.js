import { User } from '/dist/user.js'

function formatDate(date) {
    return date.toLocaleTimeString(); //toLocaleString();
}

function Comment(props) {
  return (
    <span className="comment">
      <User user={props.author} />
      <span className="comment-date">
        {formatDate(props.timestamp)}
      </span>
      <span className="comment-text">
        {props.text}
      </span>
    </span>
  );
}

export { Comment }
