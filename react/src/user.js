import { Avatar } from '/dist/avatar.js';

function User(props) {
  return (
    <div className="user">
      <Avatar user={props.user} />
      <span className="user-name">
        {props.user.name}
      </span>
    </div>
  );
}

export { User }
