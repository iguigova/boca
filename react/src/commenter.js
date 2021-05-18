// https://dmitripavlutin.com/controlled-inputs-using-react-hooks/
// https://www.robinwieruch.de/react-add-item-to-list

function Commenter({comment, onChange, onSubmit}){

    //https://reactjs.org/docs/events.html
    //https://reactjs.org/docs/handling-events.html
    function onEnter(e, handler) {
        if (event.key === "Enter" || event.keyCode === 13) {
            handler();
        }
    }

    return <div className="commenter">
      <div>
        <textarea 
          className="commenter-textarea"
          placeholder="Enter comment here..." 
          value={comment || ""} // https://stackoverflow.com/questions/47012169/a-component-is-changing-an-uncontrolled-input-of-type-text-to-be-controlled-erro
          onChange={onChange}
          onKeyPress={(e) => onEnter(e, onSubmit)} // https://www.geeksforgeeks.org/how-to-use-onkeypress-event-in-reactjs/
        />
      </div>
      <div><button className="commenter-submit" type="button" onClick={onSubmit}>Submit</button></div>
    </div>;
}

export { Commenter }
