import * as React from "react";
import { createRoot } from "react-dom/client";

function FunctionComponent() {
  const [number, setNumber] = React.useState(0);
  /*24.单节点(key 相同,类型相同) */
  // return number === 0 ? (
  //   <div onClick={() => setNumber(number + 1)} key="title" id="title">
  //     title
  //   </div>
  // ) : (
  //   <div onClick={() => setNumber(number + 1)} key="title" id="title2">
  //     title2
  //   </div>
  // );
  /*25.单节点 key 不同,类型相同*/
  // return number === 0 ? (
  //   <div onClick={() => setNumber(number + 1)} key="title1" id="title">
  //     title
  //   </div>
  // ) : (
  //   <div onClick={() => setNumber(number + 1)} key="title2" id="title2">
  //     title2
  //   </div>
  // );
  /*26.单节点 key 相同,类型不同*/
  // return number === 0 ? (
  //   <div onClick={() => setNumber(number + 1)} key="title1" id="title1">
  //     title1
  //   </div>
  // ) : (
  //   <p onClick={() => setNumber(number + 1)} key="title1" id="title1">
  //     title1
  //   </p>
  // );
  /*27.原来多个节点，现在只有一个节点*/
  return number === 0 ? (
    <ul key="container" onClick={() => setNumber(number + 1)}>
      <li key="A">A</li>
      <li key="B" id="B">
        B
      </li>
      <li key="C">C</li>
    </ul>
  ) : (
    <ul key="container" onClick={() => setNumber(number + 1)}>
      <li key="B" id="B2">
        B2
      </li>
    </ul>
  );
}
let element = <FunctionComponent />;
const root = createRoot(document.getElementById("root"));
root.render(element);
