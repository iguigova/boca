function Crumb({className, content, onClick, onMouseOver, onMouseEnter, onMouseLeave}){
    return (
      <span className={className}
        onClick={onClick}
        onMouseOver={onMouseOver}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >{content}</span>
    );
}

export { Crumb }
