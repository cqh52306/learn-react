import { HostRoot, HostComponent, HostText } from "./ReactWorkTags";
import { processUpdateQueue } from "./ReactFiberClassUpdateQueue";
import { mountChildFibers, reconcileChildFibers } from "./ReactChildFiber";
import { shouldSetTextContent } from "react-dom-bindings/src/client/ReactDOMHostConfig";
import logger, { indent } from "shared/logger";

/**
 * 根据新的虚拟DOM生成新的fiber链表
 *
 * @param {*} current 老的父fiber
 * @param {*} workInProgress 新的父fiber
 * @param {*} nextChildren 新的子虚拟DOM
 */
function reconcileChildren(current, workInProgress, nextChildren) {
  //如果此新fiber没有老fiber，说明此新fiber是新创建的
  //如果此fiber没对应的老fiber，说明此fiber是新创建的，如果这个父fiber是新的创建的，他的儿子们也肯定都是新创建的
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
  } else {
    // 如果说有老fiber的话，做DOM-DIFF，拿老的子fiber链表和新的子虚拟DOM进行比较，进行最小化的更新
    workInProgress.child = reconcileChildFibers(
      workInProgress,
      current.child,
      nextChildren
    );
  }
}
function updateHostRoot(current, workInProgress) {
  // 需要知道它的子虚拟DOM，知道它的儿子的虚拟DOM信息
  processUpdateQueue(workInProgress); // workInProgress.memoizedState = { element };
  const nextState = workInProgress.memoizedState;
  // nextChildren就是新的子虚拟DOM
  const nextChildren = nextState.element;
  // 协调子节点 DOM-DIFF算法
  // 根据新的虚拟DOM生成子fiber链表
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child; // {tag:5, type: 'h1'}
}

/**
 * 构建原生组件的子fiber链表
 *
 * @param {*} current 老fiber
 * @param {*} workInProgress 新fiber
 * @return {*}
 */
function updateHostComponent(current, workInProgress) {
  const { type } = workInProgress;
  const nextProps = workInProgress.pendingProps;
  let nextChildren = nextProps.children;
  //判断当前虚拟DOM他的儿子是不是一个文本独生子
  const isDirectTextChild = shouldSetTextContent(type, nextProps);
  if (isDirectTextChild) {
    nextChildren = null;
  }
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

/**
 *
 *根据新的虚拟DOM构建新的fiber子链表 child .sibling
 * @export
 * @param {*} current 老fiber
 * @param {*} workInProgress 新的fiber
 * @return {*}
 */
export function beginWork(current, workInProgress) {
  logger(" ".repeat(indent.number) + "beginWork", workInProgress);
  switch (workInProgress.tag) {
    case HostRoot:
      return updateHostRoot(current, workInProgress);
    case HostComponent:
      return updateHostComponent(current, workInProgress);
    case HostText:
    default:
      return null;
  }
}
