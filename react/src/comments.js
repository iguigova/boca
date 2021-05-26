import { Comment } from '/dist/comment.js'

// https://stackoverflow.com/questions/60821504/prevent-rerender-react-array-of-objects
// this has to be outside of Comments... ?? but it works this way
const CommentMemo = React.memo(({comment}) => { return <Comment comment={comment}/>;});

function Comments(props){
    //const comments = props.comments.map((comment) => <Comment key={comment.uuid} comment={comment}/>);
    const comments = props.comments.map((comment) => <CommentMemo key={comment.uuid} comment={comment}/>);

    return (
        <div className="comments">
            {comments}
        </div>
    ); 
}
 
export { Comments }
