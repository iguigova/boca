function formatDate(date) {
  return date.toLocaleDateString();
}

function Avatar(props) {
  return (
    <img className="Avatar"
      src={props.user.avatarUrl}
      alt={props.user.name}
    />
  );
}

function User(props) {
  return (
    <div className="User">
      <Avatar user={props.user} />
      <div className="Username">
        {props.user.name}
      </div>
    </div>
  );
}

function Comment(props) {
  return (
    <div className="Comment">
      <User user={props.author} />
      <div className="Comment-text">
        {props.text}
      </div>
      <div className="Comment-date">
        {formatDate(props.date)}
      </div>
    </div>
  );
}

function Comments(props){
    //const comments = props.comments;
    const comments = props.comments.map((comment) => <Comment date={comment.date} text={comment.text} author={comment.author}/>);

    return (
      <div className="Comments">
        {comments}
      </div>
    );
}

function Commentator(props){
    return <div>
      <input 
        type="text" 
        name="commentator" 
        placeholder="Enter comment here..." 
        value="test"
        //onChange={ this.handleChange } 
      />      
    </div>;
}

function App(props){
    return (
      <div>
        <div className="Comments">
          <Comments comments={props.comments}/>
        </div>
        <div className="Commentator">
          <Commentator/>
        </div>
      </div>            
      );
}

const authors = [ {name: "Kitty", avatarUrl: "https://placekitten.com/g/24/24"},
                  {name: "Stranger", avatarUrl: "https://via.placeholder.com/24/000000"}];

const comments = [{date: new Date(), text: "Hello there", author: authors[0]},
                  {date: new Date(), text: "Are you looking for me?", author: authors[1]}];

//const element = <Comment date={comment.date} text={comment.text} author={comment.author}/>;
//const element = <Comments comments = {comments}/>;
const element = <App comments = {comments}/>;

ReactDOM.render(
  element,
  document.getElementById('root')
);

