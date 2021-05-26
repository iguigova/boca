import { CommentMemo } from '/dist/comment.js'

function Comments(props){
    const comments = props.comments.map((comment) => <CommentMemo key={comment.uuid} comment={comment}/>);

    return (
        <div className="comments">
            {comments}
        </div>
    ); 
}
 
export { Comments }
