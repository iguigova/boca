import { Lightbox } from '/dist/lightbox.js'
import { Avatar } from '/dist/avatar.js'

function formatDate(date) {
    return date.toLocaleTimeString(); //toLocaleString();
}

function Comment({comment}) {
    const [popped, setPopped] = React.useState(-1);

    const lastComment = React.useRef(null);
    React.useEffect(() => { lastComment.current.scrollIntoView(); });

    React.useEffect(() => // https://stackoverflow.com/questions/53244493/react-setting-onclick-in-html-via-dangerouslysetinnerhtml
    {
        // document.getElementsByClassName('comment-pic').forEach(el => // https://stackoverflow.com/questions/15843581/how-to-correctly-iterate-through-getelementsbyclassname
        document.querySelectorAll('.comment-pic').forEach((el, index) =>
        {
            el.addEventListener('click', togglePopped);
            el.setAttribute('data-index', index);
        });
    });
    
    function togglePopped(event){
        //console.log(event.target.getAttribute('data-index'));
        
        setPopped(event ? event.target.getAttribute('data-index') : -1);
    }
       
    var sanitized = DOMPurify.sanitize(comment.text);

    // https://stackoverflow.com/a/48650863/3230645
    // email and phone number regex: https://stackoverflow.com/a/40894886/3230645
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replaceAll
    // https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml
    var url_regex = /(?:(?:(?:ftp|http)[s]*:\/\/|www\.)[^\.]+\.[^ \n]+)/gi;
    var url_markup = '<a target=_blank href="$&">$&</a>';
    var text = sanitized.replaceAll(url_regex, url_markup);
    var text_html = {__html: text};

    // https://stackoverflow.com/questions/4098415/use-regex-to-get-image-url-in-html-js // (http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|png|svg))
    // https://stackoverflow.com/questions/30587686/javascript-regex-to-find-image-urls-in-string  // \b(https?:\/\/\S+(?:png|jpe?g|gif|svg)\S*)\b    
    var pic_regex = /\b(https?:\/\/\S+(?:png|jpe?g|gif|svg)\S*)\b/gi;
    var pic_markup = '<img class="comment-pic" src="$&" alt="$&"/>';
    var pixurls = sanitized.match(pic_regex);
    var pix = (pixurls) ? pixurls.map((url) => pic_markup.replaceAll(/\$\&/gi, url)).join('') : '';
    var pix_html = {__html: pix};
       
    return (
      <div  ref={lastComment} className="comment">                                      
            <span className="comment-avatar"><Avatar user={comment.author}/></span>
            <span className="comment-date">{formatDate(comment.timestamp)}</span>
            <span className="comment-text" dangerouslySetInnerHTML={text_html}></span>
            <span className="comment-pix" dangerouslySetInnerHTML={pix_html}></span>
            { popped > -1 ? <Lightbox urls={pixurls} index={popped} onClose={togglePopped}/> : null }
      </div>);
}

// https://dev.to/dinhhuyams/introduction-to-react-memo-usememo-and-usecallback-5ei3
// https://stackoverflow.com/questions/60821504/prevent-rerender-react-array-of-objects
// this has to be outside of Comments... ?? but it works this way
const CommentMemo = React.memo(({comment}) => { return <Comment comment={comment}/>;});

export { CommentMemo, Comment }
