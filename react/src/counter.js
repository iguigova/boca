const { useState } = React;  // https://stackoverflow.com/questions/55930505/minimal-react-setup-without-webpack

function Example(props) {
  // Declare a new state variable, which we'll call "count"
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}


const element = <Example name="Sara" />;
ReactDOM.render(
  element,
  document.getElementById('root')
);
