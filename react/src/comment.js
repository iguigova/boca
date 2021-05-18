import { User } from '/dist/user.js'
import { Modal } from '/dist/modal.js'

function formatDate(date) {
    return date.toLocaleTimeString(); //toLocaleString();
}

function Comment({author, timestamp, text}) {
    const [popped, setPopped] = React.useState(false);
    
    function togglePopped(){
        setPopped(!popped);
    }
    
    return (
      <div className="comment">  
            <span className="comment-text" onClick={togglePopped}>{text}</span>
            <span className="comment-date">{formatDate(timestamp)}</span>
            {popped ? <Modal content={ <User user={author} /> } onClose={togglePopped} />
           : null}
      </div>
    );
}

export { Comment }
