import { Comments } from '/dist/comments.js'
import { Commenter } from '/dist/commenter.js'        
import { telegraph, acceptTelegrams } from '/dist/telegraph.js';

function App(props){
    const [comments, addComment] = React.useState(props.comments);
    const [comment, setComment] = React.useState();

    function sendTelegram(text){
        var telegram = {uuid: props.uuid(), timestamp: new Date().toLocaleTimeString(), text: text, author: props.user()};         
        telegraph(telegram);
    };
    
    function handleChange(event){ setComment(event.target.value); }
    function handleSubmit(event){
        if (comment){
            sendTelegram(comment)
            setComment('');
        }
    }

    React.useEffect(() => {
        sendTelegram("Welcome " + props.uuid());
        
        acceptTelegrams((telegram) => {
            // https://www.freecodecamp.org/news/learn-react-usestate-hook-in-10-minutes/
            addComment(c => c.concat(JSON.parse(telegram)));
        });
    }, []);
    
    // https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-shouldcomponentupdate
    return (
      <div className="app">
            {React.useMemo(() => <Comments comments={comments}/>, [comments])}
            <Commenter comment={comment} onChange={handleChange} onSubmit={handleSubmit}/>
      </div>);
}

export { App }
