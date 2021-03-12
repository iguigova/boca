import { Avatar } from '/dist/avatar.js';

function User(props) {
  return (
    <span className="user">
      <Avatar user={props.user} />
      <span className="username">
        {props.user.name}
      </span>
    </span>
  );
}

export { User }
