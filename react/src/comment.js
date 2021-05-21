//import { User } from '/dist/user.js'
//import { Modal } from '/dist/modal.js'

import { Avatar } from '/dist/avatar.js'

function formatDate(date) {
    return date.toLocaleTimeString(); //toLocaleString();
}

function Comment({uuid, author, timestamp, text}) {
    const [popped, setPopped] = React.useState(false);

    React.useEffect(() => { document.getElementById(uuid).scrollIntoView(); });
    
    function togglePopped(){
        setPopped(!popped);
    }

    function markup(text){
        // https://stackoverflow.com/a/40405082/3230645
        // https://stackoverflow.com/a/48650863/3230645
        // email and phone number regex: https://stackoverflow.com/a/40894886/3230645
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll
        // https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml
        var linked = text.replaceAll(/(?:(?:(?:ftp|http)[s]*:\/\/|www\.)[^\.]+\.[^ \n]+)/gi, '<a target=_blank href="$&">$&</a>');
        return {__html: DOMPurify.sanitize(linked)};
    }

    return (
      <div id={uuid} className="comment">              
            
            
            <span className="comment-avatar"><Avatar user={author}/></span>
            <span className="comment-date">{formatDate(timestamp)}</span>
            <span className="comment-text" dangerouslySetInnerHTML={markup(text)}></span>
      </div>);
    
    // return (
    //   <div id={uuid} className="comment" onClick={togglePopped}>  
    //         <span className="comment-text" dangerouslySetInnerHTML={markup(text)}></span>
    //         <span className="comment-date">{formatDate(timestamp)}</span>
    //         {popped ? <Modal content={ <User user={author} /> } onClose={togglePopped} />
    //        : null}
    //   </div>);
}

export { Comment }
