function ImgLink(props) {
    return (
            <a className="img-link" href={props.href}>
            <img className="link-img" src={props.src} alt={props.alt}/>
        </a>
    );
}

export { ImgLink }
