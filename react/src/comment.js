import { User } from '/dist/user.js'
import { Modal } from '/dist/modal.js'
import { Crumb } from '/dist/crumb.js'

function formatDate(date) {
    return date.toLocaleTimeString(); //toLocaleString();
}

function Comment({author, timestamp, text}) {
    const [popped, setPopped] = React.useState(false);
    
    function togglePopped(){
        setPopped(!popped);
    }
    
    return (
      <span className="comment">  
            <Crumb className="comment-text" onMouseOver={togglePopped} content={text}/>
            {popped ? <Modal content={
                <span>
                    <User user={author} />
                    <Crumb className="comment-date" content={formatDate(timestamp)} />
                </span>
             } onClose={togglePopped} />
           : null}
      </span>
    );
}

export { Comment }
