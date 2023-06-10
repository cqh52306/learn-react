import { setInitialProperties } from "./ReactDOMComponent";
export function shouldSetTextContent(type, props) {
  return (
    typeof props.children === "string" || typeof props.children === "number"
  );
}
export const appendInitialChild = (parent, child) => {
  parent.appendChild(child);
};
export const createInstance = (type, props, internalInstanceHandle) => {
  const domElement = document.createElement(type);
  return domElement;
};
export const createTextInstance = (content) => {
  return document.createTextNode(content);
};
export function finalizeInitialChildren(domElement, type, props) {
  setInitialProperties(domElement, type, props);
}

export function appendChild(parentInstance, child) {
  parentInstance.appendChild(child);
}

/**
 *
 *
 * @export
 * @param {*} parentInstance 父DOM节点
 * @param {*} child 子DOM节点
 * @param {*} beforeChild 插入到谁的前面，它也是一个DOM节点
 */
export function insertBefore(parentInstance, child, beforeChild) {
  parentInstance.insertBefore(child, beforeChild);
}
