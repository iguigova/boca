// https://dmitripavlutin.com/controlled-inputs-using-react-hooks/
// https://www.robinwieruch.de/react-add-item-to-list
function Commenter({comment, onChange, onSubmit}){
    return <div>
      <input 
        type="text" 
        name="commenter" 
        placeholder="Enter comment here..." 
        value={comment}
        onChange={onChange} 
      />
      <button type="button" onClick={onSubmit}>Submit</button>   
    </div>;
}

export { Commenter }
