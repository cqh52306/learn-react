// 要想知道为什么会有fiber，需要知道fiber以前是怎么工作的
// 我们有一个虚拟DOM
let element = (
  <div id="A1">
    <div id="B1">
      <div id="C1"></div>
      <div id="C2"></div>
    </div>
    <div id="B2"></div>
  </div>
);

let vDom = {
  type: "div",
  key: "A1",
  props: {
    id: "A1",
    children: [
      {
        type: "div",
        key: "B1",
        props: {
          id: "B1",
          children: [
            {
              type: "div",
              key: "C1",
              props: { id: "C1" },
            },
            {
              type: "div",
              key: "C2",
              props: { id: "C2" },
            },
          ],
        },
      },
      {
        type: "div",
        key: "B2",
        props: { id: "B2" },
      },
    ],
  },
};
// 以前我们直接把vDom渲染成真实的dom
function render(element, container) {
  //根据虚拟DOM生成真实DOM
  let dom = document.createElement(element.type);
  // 把除children以外的属性拷贝到真实DOM
  Object.keys(element.props)
    .filter((key) => key !== "children")
    .forEach((key) => {
      dom[key] = element.props[key];
    });
  // 代码执行到此处，想中断，无法实现断点续执行
  // 把此虚拟DOM的子节点，也渲染到父节点真实DOM上
  if (Array.isArray(element.props.children)) {
    element.props.children.forEach((child) => render(child, dom));
  }
  container.appendChild(dom);
}

render(vDom, document.getElementById("root"));
