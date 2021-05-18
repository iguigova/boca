import { Comments } from '/dist/comments.js'
import { Commenter } from '/dist/commenter.js'        

function App(props){
    const [comments, addComment] = React.useState(props.comments);
    const [comment, setComment] = React.useState();
    
    function handleChange(event){ setComment(event.target.value);}
    function handleSubmit(){
        addComment(comments.concat({uuid: props.uuid(), timestamp: new Date(), text: comment, author: props.users[0]}));
        setComment('');
    }
    
    return (
      <div className="app">
        <Comments comments={comments}/>
        <Commenter comment={comment} onChange={handleChange} onSubmit={handleSubmit}/>
      </div>);
}

export { App }
