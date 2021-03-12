import { Avatar } from '/dist/avatar.js';

function User(props) {
  return (
    <span className="User">
      <Avatar user={props.user} />
      <span className="Username">
        {props.user.name}
      </span>
    </span>
  );
}

export { User }
