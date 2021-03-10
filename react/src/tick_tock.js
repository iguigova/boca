// function tick() {
//   const element = (
//     <div>
//       <h1>Hello, world!</h1>
//       <h2>It is {new Date().toLocaleTimeString()}.</h2>
//     </div>
//   );
//   ReactDOM.render(element, document.getElementById('root'));
// }

function Clock(props){
    return (
            <div>
            <h1>Hello, world!</h1>
            <h2>It is {props.date.toLocaleTimeString()}.</h2>
            </div>
    };
}

function tick(){
    ReactDom.render(<Clock date={new Date()}/>, document.getElementById('root'));
}


setInterval(tick, 1000);
