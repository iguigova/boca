// https://dmitripavlutin.com/controlled-inputs-using-react-hooks/
// https://www.robinwieruch.de/react-add-item-to-list

function Commenter({comment, onChange, onSubmit}){

    //https://reactjs.org/docs/events.html
    //https://reactjs.org/docs/handling-events.html
    function onEnter(e, handler) {
        if (e.key === "Enter" || e.keyCode === 13) {
            e.preventDefault();
            handler();            
        }
    }

    function uploadPix(e){
        const f = e.target.files[0];
                
        console.log(f);

        const furl = 'https://la.storage.bunnycdn.com//boca-uswest/images/' + f.name;        
        const options = {
            method: 'PUT',
            headers: {'Content-Type': 'application/octet-stream', 'AccessKey': '77626b12-96e4-48ba-94738382ddd7-797e-4702'},
            body: f
        };

        fetch(furl, options)
            .then(response => response.json())
            .then(response => console.log(response))
            .catch(err => console.error(err));        
    }
    
    return <div className="commenter">
        <textarea
          autoFocus
          className="commenter-textarea"
          placeholder="Enter comment here..." 
          value={comment || ""} // https://stackoverflow.com/questions/47012169/a-component-is-changing-an-uncontrolled-input-of-type-text-to-be-controlled-erro
          onChange={onChange}
          onKeyPress={(e) => onEnter(e, onSubmit)} // https://www.geeksforgeeks.org/how-to-use-onkeypress-event-in-reactjs/
        />
        <button className="commenter-submit" type="button" onClick={onSubmit}>Submit</button>
        <button className="commenter-pix1" type="button" onClick={onSubmit}>Pix</button>
        <label className="commenter-pix" htmlFor="commenter-pix-chooser">Pix</label>
        <input className="commenter-pix-chooser" type="file" id="commenter-pix-chooser" name="commenter-pix-chooser" accept=".jpg, .jpeg, .png" multiple onChange={uploadPix}/>
    </div>;
}

export { Commenter }
