import { createRoot } from "react-dom/client";
// let element = (
//   <h1 id="container">
//     hello<span style={{ color: "red" }}>world</span>
//   </h1>
// );

// function FunctionComponent() {
//   return (
//     <h1>
//       hello<span style={{ color: "red" }}>world</span>
//     </h1>
//   );
// }

function FunctionComponent() {
  return (
    <h1
      onClick={() => console.log("父onClick FunctionComponent")}
      onClickCapture={() => console.log("父onClickCapture FunctionComponent")}
    >
      hello
      <span
        style={{ color: "red" }}
        onClick={() => console.log("子onClick span")}
        onClickCapture={() => console.log("子onClickCapture span")}
      >
        world
      </span>
    </h1>
  );
}

let element = <FunctionComponent />;

//old let element = React.createElement(FunctionComponent);//new let element = jsx(FunctionComponent);

const root = createRoot(document.getElementById("root"));
// 把element虚拟DOM渲染到容器中
root.render(element);
