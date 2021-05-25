import { Comment } from '/dist/comment.js'

function Comments(props){
    const comments = props.comments.map((comment) => <Comment key={comment.uuid} comment={comment}/>);

    return (
        <div className="comments">
            {comments}
        </div>
    ); 
}
 
export { Comments }
