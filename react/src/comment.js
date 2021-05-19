import { User } from '/dist/user.js'
import { Modal } from '/dist/modal.js'

function formatDate(date) {
    return date.toLocaleTimeString(); //toLocaleString();
}

function Comment({uuid, author, timestamp, text}) {
    const [popped, setPopped] = React.useState(false);

    React.useEffect(() => {document.getElementById(uuid).scrollIntoView();});
    
    function togglePopped(){
        setPopped(!popped);
    }
    
    return (
      <div id={uuid} className="comment" onClick={togglePopped}>  
            <span className="comment-text">{text}</span>
            <span className="comment-date">{formatDate(timestamp)}</span>
            {popped ? <Modal content={ <User user={author} /> } onClose={togglePopped} />
           : null}
      </div>
    );
}

export { Comment }
