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
    <span className="User">
      <Avatar user={props.user} />
      <span className="Username">
        {props.user.name}
      </span>
    </span>
  );
}

function Comment(props) {
  return (
    <span className="Comment">
      <User user={props.author} />
      <span className="Comment-date">
          : {formatDate(props.date)} : 
      </span>
      <span className="Comment-text">
        {props.text}
      </span>
    </span>
  );
}

function Comments(props){
    //const comments = props.comments;
    const comments = props.comments.map((comment) => <div><Comment date={comment.date} text={comment.text} author={comment.author}/></div>);

    return (
      <div className="Comments">
        {comments}
      </div>
    );
}

// https://dmitripavlutin.com/controlled-inputs-using-react-hooks/
// https://www.robinwieruch.de/react-add-item-to-list
function Commentator({comment, onChange, onSubmit}){
    return <div>
      <input 
        type="text" 
        name="commentator" 
        placeholder="Enter comment here..." 
        value={comment}
        onChange={onChange} 
      />
      <button type="button" onClick={onSubmit}>Submit</button>   
    </div>;
}

function App(props){
    const [comments, addComment] = React.useState(props.comments);
    const [comment, setComment] = React.useState();
    
    function handleChange(event){ setComment(event.target.value);}
    function handleSubmit(){ addComment(comments.concat({date: new Date(), text: comment, author: authors[0]})); setComment('');}
    
    return (
      <div>
        <div>
          <Comments comments={comments}/>
        </div>
        <div>
            <Commentator comment={comment} onChange={handleChange} onSubmit={handleSubmit}/>
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

