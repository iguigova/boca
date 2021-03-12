import { User } from '/dist/user.js'

function formatDate(date) {
    return date.toLocaleString();
}

function Comment(props) {
  return (
    <span className="Comment">
      <User user={props.author} />
      <span className="Comment-date">
          : {formatDate(props.timestamp)} : 
      </span>
      <span className="Comment-text">
        {props.text}
      </span>
    </span>
  );
}

export { Comment }
