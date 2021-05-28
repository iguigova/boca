// https://www.w3schools.com/w3css/tryit.asp?filename=tryw3css_modal_lightbox

function Lightbox({urls, index, onClose}){
    const [current, setCurrent] = React.useState(index);
    
    var pix = urls ? urls.map((url) => {return <img key={url} className="lightbox-pic" src={url} alt={url} />}) : null;
    var index = urls ? urls.map((url) => { return <img key={url} className="lightbox-index-pic" src={url}/>}) : null;

    var pic = pix ? pix[current] : null;
    
    function plusDivs(){
    }
    
    return (
      urls ?   
      <div className="lightbox">
        <span className="lightbox-close" onClick={onClose}>&times;</span>
        {pic}
        <button className="lightbox-left" onClick="plusDivs(-1)">&#10094;</button>
        <button className="lightbox-right" onClick="plusDivs(1)">&#10095;</button>
        <div className="lightbox-index">
            {index}
        </div>
      </div>
      : null
    );    
}

export { Lightbox }
