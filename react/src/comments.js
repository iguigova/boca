import { Comment } from '/dist/comment.js'

function Comments(props){
    //const comments = props.comments;
    const comments = props.comments.map((comment) =>
       <Comment key={comment.uuid} uuid={comment.uuid} timestamp={comment.timestamp} text={comment.text} author={comment.author}/>);

    return (
        <div className="comments">
            {comments}
        </div>
    ); 
}

export { Comments }
