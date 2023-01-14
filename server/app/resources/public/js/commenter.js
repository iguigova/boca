import { uploadPic } from '/dist/utils.js';
import { ImgLink } from '/dist/imglink.js';

// https://dmitripavlutin.com/controlled-inputs-using-react-hooks/
// https://www.robinwieruch.de/react-add-item-to-list

function Commenter({comment, onChange, onSubmit}){
    const textarea = React.useRef(null);
    
    //https://reactjs.org/docs/events.html
    //https://reactjs.org/docs/handling-events.html
    function onEnter(e, handler) {
        if (e.key === "Enter" || e.keyCode === 13) {
            e.preventDefault();
            handler();            
        }
    }

    function getValueSetter(element) {
        const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
        const prototype = Object.getPrototypeOf(element);
        const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;

        return (valueSetter && valueSetter !== prototypeValueSetter) ? prototypeValueSetter : valueSetter;
    }

    function setValueSetterValue(element, value){
        getValueSetter(element).call(element, value);
    }

    function appendValue(element, value){
        setValueSetterValue(element, element.value + value);
        element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    function uploadPix(files){
        for (const f of files){
            
            const url = uploadPic(f); // TODO: Do some checking on the file - type, size, etc.
            appendValue(textarea.current, ' ' + encodeURI(url) + ' ');
        }
    }
    
    function loadPix(e){
        uploadPix(e.target.files);
        e.target.value = null;
        textarea.current.focus();
    }
    
    return <div className="commenter">
        <textarea
          autoFocus
          className="commenter-textarea"
          placeholder="Enter comment here..." 
          ref={textarea}
          value={comment || ""} // https://stackoverflow.com/questions/47012169/a-component-is-changing-an-uncontrolled-input-of-type-text-to-be-controlled-erro
          onChange={onChange}
          onKeyPress={(e) => onEnter(e, onSubmit)} // https://www.geeksforgeeks.org/how-to-use-onkeypress-event-in-reactjs/
        />
        <label className="fa-solid fa-paper-plane" htmlFor="commenter-submit"></label>
        <button className="commenter-submit" id="commenter-submit" name="commenter-submit" type="button" onClick={onSubmit}>Submit</button>
        <label className="fa-solid fa-images" htmlFor="commenter-pix-chooser"></label>
        <input className="commenter-pix-chooser" id="commenter-pix-chooser" name="commenter-pix-chooser" type="file" accept="image/*" multiple onChange={loadPix}/>
        <ImgLink href="/about" src="/images/boca.png" alt="boca logo"/>
    </div>;
}

export { Commenter }

// https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/capture
// var el = document.createElement('input')
// var supported = el.capture != undefined

// console.log('capture supported: '+supported)
//  <input type="file" accept="image/*" capture="camera"/>
