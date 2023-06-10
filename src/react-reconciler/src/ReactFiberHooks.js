/**
 * 渲染函数组件
 *
 * @export
 * @param {*} current 老fiber
 * @param {*} workInProgress 新fiber
 * @param {*} Component 组件定义
 * @param {*} props 组件属性
 * @return {*} 虚拟DOM或者react元素
 */
export function renderWithHooks(current, workInProgress, Component, props) {
  const children = Component(props);
  return children;
}
