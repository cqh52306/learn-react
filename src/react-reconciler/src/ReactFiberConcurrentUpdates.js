import { HostRoot } from "./ReactWorkTags";

/**
 * 目前只实现向上找到根节点
 *
 * @export
 * @param {*} sourceFiber
 * @return {*}
 */
export function markUpdateLaneFromFiberToRoot(sourceFiber) {
  let node = sourceFiber; // 当前fiber
  let parent = sourceFiber.return; // 当前fiber父fiber
  while (parent !== null) {
    node = parent;
    parent = parent.return;
  }
  // 一直找到parent为null
  if (node.tag === HostRoot) {
    const root = node.stateNode;
    return root;
  }
  return null;
}
