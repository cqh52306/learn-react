import ReactSharedInternals from "shared/ReactSharedInternals";
import { enqueueConcurrentHookUpdate } from "./ReactFiberConcurrentUpdates";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";

const { ReactCurrentDispatcher } = ReactSharedInternals;
let currentlyRenderingFiber = null;
let workInProgressHook = null;

/**
 * 挂载构建中的hook
 *
 * @return {*}
 */
function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null, // hook状态 0
    queue: null, // 存放本hook的更新队列 queue.pending = update的循环链表
    next: null, // 指向下一个hook，一个函数里可能会对应多个hook，他们会组成一个单向链表
  };
  if (workInProgressHook === null) {
    // 当前函数对应的fiber的状态等于第一个hook对象
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook;
  } else {
    workInProgressHook = workInProgressHook.next = hook;
  }
  return workInProgressHook;
}

/**
 * 执行派发动作的方法，它要更新状态，并且让界面重新更新
 *
 * @param {*} fiber function对应的fiber
 * @param {*} queue hook对应的更新队列
 * @param {*} action 派发的动作
 */
function dispatchReducerAction(fiber, queue, action) {
  console.log("dispatchReducerAction", fiber, queue, action);
  //在每个hook里会存放一个更新队列，更新队列是一个更新对象的循环链表update1.next=update2.next=update1
  const update = {
    action, //{ type: 'add', payload: 1 } 派发的动作
    next: null, //指向下一个更新对象
  };
  // 把当前的最新的更添的添加更新队列中，并且返回当前的根fiber
  const root = enqueueConcurrentHookUpdate(fiber, queue, update);
  scheduleUpdateOnFiber(root, fiber);
}
const HooksDispatcherOnMountInDEV = {
  useReducer: mountReducer,
};

function mountReducer(reducer, initialArg) {
  const hook = mountWorkInProgressHook();
  hook.memoizedState = initialArg;
  const queue = {
    pending: null,
    dispatch: null,
  };
  hook.queue = queue;
  const dispatch = (queue.dispatch = dispatchReducerAction.bind(
    null,
    currentlyRenderingFiber,
    queue
  ));
  return [hook.memoizedState, dispatch];
}

function useReducer(reducer, initialArg) {
  const hook = mountWorkInProgressHook();
  hook.memoizedState = initialArg;
  const queue = {
    pending: null,
    dispatch: null,
  };
  hook.queue = queue;
  const dispatch = (queue.dispatch = dispatchReducerAction.bind(
    null,
    currentlyRenderingFiber,
    queue
  ));
  return [hook.memoizedState, dispatch];
}

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
  currentlyRenderingFiber = workInProgress; // Function组件对应的fiber
  if (current !== null && current.memoizedState !== null) {
  } else {
    ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV;
  }
  // 需要要函数组件执行前给ReactCurrentDispatcher.current赋值
  const children = Component(props);
  currentlyRenderingFiber = null;
  return children;
}
