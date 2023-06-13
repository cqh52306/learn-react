import * as React from "react";
import { createRoot } from "react-dom/client";

function FunctionComponent() {
  const [number, setNumber] = React.useState(0);
  //如果使用的是useState，调用setNumber的时候传入的是老状态，则不需要更新
  return (
    <button
      onClick={() => {
        setNumber(number + 1);
      }}
    >
      {number}
    </button>
  );
}
let element = <FunctionComponent />;
const root = createRoot(document.getElementById("root"));
root.render(element);

//老fiber树 div#root对应的fiber.child=FunctionComponent的fiber.child=button.fiber
