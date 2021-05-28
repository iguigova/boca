// https://www.w3schools.com/w3css/tryit.asp?filename=tryw3css_modal_lightbox

function Lightbox({urls, index, onClose}){
    const [curr, setCurr] = React.useState(index);
    
    var pix = urls ? urls.map((url) => {return <img key={url} className="lightbox-pic" src={url} alt={url} />}) : null;
    var index = urls ? urls.map((url, idx) => { return <img key={url} className="lightbox-index-pic" src={url} onClick={() => {showPicture(idx)}}/>}) : null;

    var pic = pix ? pix[curr] : null;
    
    function showPicture(idx){
        setCurr(idx);
    }
    
    return (
      urls ?   
      <div className="lightbox">
        <button className="lightbox-close" onClick={onClose}>&times;</button>
        <div className="lightbox-index">
          <button className="lightbox-left" onClick={() => showPicture((curr - 1 < 0 ? pix.length : curr) - 1)}>&#10094;</button>
          {index}
          <button className="lightbox-right" onClick={() => showPicture((curr + 1 < pix.length) ? curr + 1 : 0)}>&#10095;</button>
        </div>
        {pic}
      </div>
      : null
    );    
}

export { Lightbox }
