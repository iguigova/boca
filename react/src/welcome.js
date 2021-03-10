function Welcome(props) {
//    return <h1>Hello, {props.name}</h1>; 

    return <table id="comments">
  <caption>Welcome</caption>
  <tbody>
    <tr>
      <th>Id1</th>
      <td>Text 1</td>
    </tr>
    <tr>
      <th>Id2</th>
      <td>Text 2</td>
    </tr>
  </tbody>
  <tfoot>
    <tr>
      <th><input value="ID"/></th>
      <td><textarea>Enter your comment here</textarea></td>
    </tr>
 </tfoot>
</table>
}

const element = <Welcome name="Sara" />;
ReactDOM.render(
  element,
  document.getElementById('root')
);
