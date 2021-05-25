//import { User } from '/dist/user.js'
//import { Modal } from '/dist/modal.js'

import { Avatar } from '/dist/avatar.js'

function formatDate(date) {
    return date.toLocaleTimeString(); //toLocaleString();
}

function Comment({comment}) {
    const [popped, setPopped] = React.useState(false);

    React.useEffect(() => { document.getElementById(comment.uuid).scrollIntoView(); });
    
    function togglePopped(){
        setPopped(!popped);
    }

    function markup(text, markup){
        // https://stackoverflow.com/a/40405082/3230645
        // https://stackoverflow.com/a/48650863/3230645
        // email and phone number regex: https://stackoverflow.com/a/40894886/3230645
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll
        // https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml

        //var linked = text.replaceAll(/(?:(?:(?:ftp|http)[s]*:\/\/|www\.)[^\.]+\.[^ \n]+)/gi, markup);

        return {__html: DOMPurify.sanitize(text).replaceAll(/(?:(?:(?:ftp|http)[s]*:\/\/|www\.)[^\.]+\.[^ \n]+)/gi, markup)};
    }

    function pixup(text, markup){
        // https://stackoverflow.com/questions/4098415/use-regex-to-get-image-url-in-html-js
        // (http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))

        // https://stackoverflow.com/questions/30587686/javascript-regex-to-find-image-urls-in-string
        // \b(https?:\/\/\S+(?:png|jpe?g|gif|svg)\S*)\b

        var pix =  text.match(/\b(https?:\/\/\S+(?:png|jpe?g|gif|svg)\S*)\b/gi);
        return {__html: (pix) ? pix.map((pic) => markup.replaceAll(/\$\&/gi, pic)) : ''};
    }
    
    return (
      <div id={comment.uuid} className="comment">                                      
            <span className="comment-avatar"><Avatar user={comment.author}/></span>
            <span className="comment-date">{formatDate(comment.timestamp)}</span>
            <span className="comment-text" dangerouslySetInnerHTML={markup(comment.text, '<a target=_blank href="$&">$&</a>')}></span>
            <span className="comment-pix" dangerouslySetInnerHTML={pixup(comment.text, '<img src="$&" alt="$&"/>')}></span>             
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
