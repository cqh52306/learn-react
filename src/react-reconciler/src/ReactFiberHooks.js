import ReactSharedInternals from "shared/ReactSharedInternals";
import { enqueueConcurrentHookUpdate } from "./ReactFiberConcurrentUpdates";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";
import is from "shared/objectIs";
import { Passive as PassiveEffect } from "./ReactFiberFlags";
import {
  HasEffect as HookHasEffect,
  Passive as HookPassive,
} from "./ReactHookEffectTags";

const { ReactCurrentDispatcher } = ReactSharedInternals;
let currentlyRenderingFiber = null;
let workInProgressHook = null;
let currentHook = null;

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
  useState: mountState,
  useEffect: mountEffect,
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
  workInProgress.updateQueue = null;
  workInProgress.memoizedState = null;
  //如果有老的fiber,并且有老的hook链表
  if (current !== null && current.memoizedState !== null) {
    ReactCurrentDispatcher.current = HooksDispatcherOnUpdateInDEV;
  } else {
    ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV;
  }
  // 需要要函数组件执行前给ReactCurrentDispatcher.current赋值
  const children = Component(props);
  currentlyRenderingFiber = null;
  workInProgressHook = null;
  currentHook = null;
  return children;
}

function mountState(initialState) {
  const hook = mountWorkInProgressHook();
  hook.memoizedState = hook.baseState = initialState;
  const queue = {
    pending: null,
    dispatch: null,
    lastRenderedReducer: basicStateReducer, // 上一个reducer
    lastRenderedState: initialState, // 上一个state
  };
  hook.queue = queue;
  const dispatch = (queue.dispatch = dispatchSetState.bind(
    null,
    currentlyRenderingFiber,
    queue
  ));
  return [hook.memoizedState, dispatch];
}

function dispatchSetState(fiber, queue, action) {
  const update = {
    action,
    hasEagerState: false, //是否有急切的更新
    eagerState: null, //急切的更新状态
    next: null,
  };
  //当你派发动作后，我立刻用上一次的状态和上一次的reducer计算新状态
  const lastRenderedReducer = queue.lastRenderedReducer;
  const currentState = queue.lastRenderedState;
  const eagerState = lastRenderedReducer(currentState, action);
  update.hasEagerState = true;
  update.eagerState = eagerState;
  if (is(eagerState, currentState)) {
    return;
  }
  //下面是真正的入队更新，并调度更新逻辑
  const root = enqueueConcurrentHookUpdate(fiber, queue, update);
  scheduleUpdateOnFiber(root, fiber);
}
function updateState(initialState) {
  return updateReducer(basicStateReducer, initialState);
}

/**
 * 构建新hook
 *
 * @return {*}
 */
function updateWorkInProgressHook() {
  // 获取将要构建的新的hook的老hook
  if (currentHook === null) {
    const current = currentlyRenderingFiber.alternate;
    currentHook = current.memoizedState;
  } else {
    currentHook = currentHook.next;
  }
  // 根据老hook创建新hook
  const newHook = {
    memoizedState: currentHook.memoizedState,
    queue: currentHook.queue,
    next: null,
  };
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = newHook;
  } else {
    workInProgressHook = workInProgressHook.next = newHook;
  }
  return workInProgressHook;
}

const HooksDispatcherOnUpdateInDEV = {
  useReducer: updateReducer,
  useState: updateState,
  useEffect: updateEffect,
};

function updateEffect(create, deps) {
  return updateEffectImpl(PassiveEffect, HookPassive, create, deps);
}
function updateEffectImpl(fiberFlags, hookFlags, create, deps) {
  const hook = updateWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  let destroy;
  //上一个老hook
  if (currentHook !== null) {
    //获取此useEffect这个Hook上老的effect对象 create deps destroy
    const prevEffect = currentHook.memoizedState;
    destroy = prevEffect.destroy;
    if (nextDeps !== null) {
      const prevDeps = prevEffect.deps;
      // 用新数组和老数组进行对比，如果一样的话
      if (areHookInputsEqual(nextDeps, prevDeps)) {
        // 不管要不要重新执行，都需要把新的effect组成完整的循环链表放到fiber.updateQueue中
        hook.memoizedState = pushEffect(hookFlags, create, destroy, nextDeps);
        return;
      }
    }
  }
  //如果要执行的话需要修改fiber的flags
  currentlyRenderingFiber.flags |= fiberFlags;
  //如果要执行的话 添加HookHasEffect flag
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    destroy,
    nextDeps
  );
}

function areHookInputsEqual(nextDeps, prevDeps) {
  if (prevDeps === null) {
    return false;
  }
  for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
    if (is(nextDeps[i], prevDeps[i])) {
      continue;
    }
    return false;
  }

  return true;
}

function mountEffect(create, deps) {
  return mountEffectImpl(PassiveEffect, HookPassive, create, deps);
}
function mountEffectImpl(fiberFlags, hookFlags, create, deps) {
  const hook = mountWorkInProgressHook();
  const nextDeps = deps === undefined ? null : deps;
  //给当前的函数组件fiber添加flags
  currentlyRenderingFiber.flags |= fiberFlags;
  hook.memoizedState = pushEffect(
    HookHasEffect | hookFlags,
    create,
    undefined,
    nextDeps
  );
}
/**
 * 添加effect链表
 *
 * @param {*} tag effect的标签
 * @param {*} create  创建方法
 * @param {*} destroy 销毁方法
 * @param {*} deps 依赖数组
 * @return {*}
 */
function pushEffect(tag, create, destroy, deps) {
  const effect = {
    tag,
    create,
    destroy,
    deps,
    next: null,
  };
  let componentUpdateQueue = currentlyRenderingFiber.updateQueue;
  if (componentUpdateQueue === null) {
    componentUpdateQueue = createFunctionComponentUpdateQueue();
    currentlyRenderingFiber.updateQueue = componentUpdateQueue;
    componentUpdateQueue.lastEffect = effect.next = effect;
  } else {
    const lastEffect = componentUpdateQueue.lastEffect;
    if (lastEffect === null) {
      componentUpdateQueue.lastEffect = effect.next = effect;
    } else {
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
  }
  return effect;
}
function createFunctionComponentUpdateQueue() {
  return {
    lastEffect: null,
  };
}

//useState其实就是一个内置了reducer的useReducer
function basicStateReducer(state, action) {
  return typeof action === "function" ? action(state) : action;
}

function updateReducer(reducer) {
  //获取新的hook
  const hook = updateWorkInProgressHook();
  //获取新的hook的更新队列
  const queue = hook.queue;
  queue.lastRenderedReducer = reducer;
  //获取老的hook
  const current = currentHook;
  //获取将要生效的更新队列
  const pendingQueue = queue.pending;
  //初始化一个新的状态，取值为当前的状态
  let newState = current.memoizedState;
  if (pendingQueue !== null) {
    queue.pending = null;
    const first = pendingQueue.next;
    let update = first;
    do {
      // if (update.hasEagerState) {
      //   newState = update.eagerState;
      // } else {
      //   const action = update.action;
      //   newState = reducer(newState, action);
      // }
      const action = update.action;
      newState = reducer(newState, action);
      update = update.next;
    } while (update !== null && update !== first);
  }
  hook.memoizedState = queue.lastRenderedState = newState;
  return [hook.memoizedState, queue.dispatch];
}
