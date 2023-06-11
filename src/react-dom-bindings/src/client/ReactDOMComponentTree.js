const randomKey = Math.random().toString(36).slice(2);
const internalInstanceKey = "__reactFiber$" + randomKey;
const internalPropsKey = "__reactProps$" + randomKey;

/**
 * 从真实的DOM节点上获取它对应的fiber节点
 *
 * @export
 * @param {*} targetNode
 * @return {*}
 */
export function getClosestInstanceFromNode(targetNode) {
  const targetInst = targetNode[internalInstanceKey];
  if (targetInst) {
    return targetInst;
  }
  return null;
}

export function getFiberCurrentPropsFromNode(node) {
  return node[internalPropsKey] || null;
}

/**
 * 提前缓存fiber节点的实例到DOM节点上
 *
 * @export
 * @param {*} hostInst fiber实例
 * @param {*} node 真实DOM
 */
export function precacheFiberNode(hostInst, node) {
  node[internalInstanceKey] = hostInst;
}

export function updateFiberProps(node, props) {
  node[internalPropsKey] = props;
}
