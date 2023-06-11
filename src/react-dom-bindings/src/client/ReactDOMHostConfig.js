import { setInitialProperties, diffProperties } from "./ReactDOMComponent";
import { precacheFiberNode, updateFiberProps } from "./ReactDOMComponentTree";

export function shouldSetTextContent(type, props) {
  return (
    typeof props.children === "string" || typeof props.children === "number"
  );
}
export const appendInitialChild = (parent, child) => {
  parent.appendChild(child);
};

/**
 * 在原生组件初次挂载的时候， 会通过此方法创建真实DOM
 *
 * @export
 * @param {*} type 类型 span
 * @param {*} props 属性
 * @param {*} internalInstanceHandle 对应的fiber
 */
export const createInstance = (type, props, internalInstanceHandle) => {
  const domElement = document.createElement(type);
  precacheFiberNode(internalInstanceHandle, domElement);
  // 把属性直接保存在domElement的属性上
  updateFiberProps(domElement, props);
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

export function prepareUpdate(domElement, type, oldProps, newProps) {
  return diffProperties(domElement, type, oldProps, newProps);
}
