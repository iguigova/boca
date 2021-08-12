import { Comments } from '/dist/comments.js'
import { Commenter } from '/dist/commenter.js'        
import { telegraph } from '/dist/telegraph.js';

function App(props){
    const [comments, addComment] = React.useState(props.comments);
    const [comment, setComment] = React.useState();

    function handleChange(event){ setComment(event.target.value); }
    function handleSubmit(event){
        if (comment){
            var telegram = {uuid: props.uuid(), timestamp: new Date().toLocaleTimeString(), text: comment, author: props.user()};
            //addComment(comments.concat(telegram));            
            telegraph(telegram, (msg) => { addComment(comments.concat(JSON.parse(msg))); });
            setComment('');
        }
    }

    // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-shouldcomponentupdate
    return (
      <div className="app">
            {React.useMemo(() => <Comments comments={comments}/>, [comments])}
            <Commenter comment={comment} onChange={handleChange} onSubmit={handleSubmit}/>
      </div>);
}

export { App }
