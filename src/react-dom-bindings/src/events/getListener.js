import { getFiberCurrentPropsFromNode } from "../client/ReactDOMComponentTree";

/**
 * 获取此fiber上对应的回调函数
 *
 * @export
 * @param {*} inst
 * @param {*} registrationName
 * @return {*}
 */
export default function getListener(inst, registrationName) {
  const stateNode = inst.stateNode;
  if (stateNode === null) {
    return null;
  }
  const props = getFiberCurrentPropsFromNode(stateNode);
  if (props === null) {
    return null;
  }
  const listener = props[registrationName];
  return listener;
}
