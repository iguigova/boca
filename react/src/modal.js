// https://medium.com/@daniela.sandoval/creating-a-popup-window-using-js-and-react-4c4bd125da57

function Modal({content, onClose}) {
    return (
        <div className="modal">
            <span className="modal-close" onClick={onClose}>&times;</span>
            {content}
        </div>
    );
}

export { Modal }
