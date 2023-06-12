import {
  appendInitialChild,
  createInstance,
  createTextInstance,
  finalizeInitialChildren,
  prepareUpdate,
} from "react-dom-bindings/src/client/ReactDOMHostConfig";
import {
  HostComponent,
  HostRoot,
  HostText,
  FunctionComponent,
} from "./ReactWorkTags";
import { NoFlags, Update } from "./ReactFiberFlags";
import logger, { indent } from "shared/logger";

function bubbleProperties(completedWork) {
  let subtreeFlags = NoFlags;
  let child = completedWork.child;
  // 遍历当前fiber的所有子节点，把所有子节点的副作用，以及子节点的子节点的副作用全部合并
  while (child !== null) {
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;
    child = child.sibling;
  }
  completedWork.subtreeFlags |= subtreeFlags;
}

/**
 * 把当前的完成的fiber所有的子节点对应的真实DOM都挂载到自己的父parent真实DOM节点上
 *
 * @param {*} parent 当前完成的fiber真实的DOM节点
 * @param {*} workInProgress 完成的fiber
 * @return {*}
 */
function appendAllChildren(parent, workInProgress) {
  // 我们只有创建的顶级fiber，但需要递归其子节点来查找所有终端节点
  let node = workInProgress.child;
  while (node !== null) {
    // 如果是原生节点，直接添加到父节点上
    if (node.tag === HostComponent || node.tag === HostText) {
      appendInitialChild(parent, node.stateNode);
      // 再看看第一个节节点是不是原生节点
      // 如果第一个儿子不是原生节点，说明它可能是一个函数组件
    } else if (node.child !== null) {
      // node.child.return = node
      node = node.child;
      continue;
    }
    if (node === workInProgress) {
      return;
    }
    // 如果没有弟弟就找父亲的弟弟
    while (node.sibling === null) {
      // 如果找到了根节点或者回到了原节点结束
      if (node.return === null || node.return === workInProgress) {
        return;
      }
      // 回到父节点
      node = node.return;
    }
    // node.sibling.return = node.return
    // 下一个弟弟节点
    node = node.sibling;
  }
}

function markUpdate(workInProgress) {
  workInProgress.flags |= Update; //给当前的fiber添加更新的副作用
}

/**
 * 在fiber(button)的完成阶段准备更新DOM
 *
 * @param {*} current button老fiber
 * @param {*} workInProgress button的新fiber
 * @param {*} type 类型
 * @param {*} newProps 新属性
 */
function updateHostComponent(current, workInProgress, type, newProps) {
  const oldProps = current.memoizedProps; //老的属性
  const instance = workInProgress.stateNode; //老的DOM节点
  //比较新老属性，收集属性的差异
  const updatePayload = prepareUpdate(instance, type, oldProps, newProps);
  //让原生组件的新fiber更新队列等于[]
  workInProgress.updateQueue = updatePayload;
  console.log("updatePayload", updatePayload);
  if (updatePayload) {
    markUpdate(workInProgress);
  }
}
/**
 *  完成一个fiber节点
 *
 * @export
 * @param {*} current 老fiber
 * @param {*} workInProgress 新的构建的fiber
 */
export function completeWork(current, workInProgress) {
  indent.number -= 2;
  // logger(" ".repeat(indent.number) + "completeWork", workInProgress);
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    // 原生节点
    case HostComponent: {
      // 现在只是在处理创建或者挂载新节点的逻辑，后面此处进行区分是初次挂载还是更新
      // 创建真实DOM节点
      const { type } = workInProgress;
      // 如果老fiber存在，并且老fiber上真实DOM节点，要走节点更新的逻辑
      if (current !== null && workInProgress.stateNode != null) {
        updateHostComponent(current, workInProgress, type, newProps);
      } else {
        const instance = createInstance(type, newProps, workInProgress);
        // 把自己的所有儿子都挂载到自己身上
        appendAllChildren(instance, workInProgress);
        workInProgress.stateNode = instance;
        finalizeInitialChildren(instance, type, newProps);
        //向上冒泡
        bubbleProperties(workInProgress);
      }
      bubbleProperties(workInProgress);
      break;
    }
    case FunctionComponent:
      bubbleProperties(workInProgress);
      break;
    case HostRoot:
      bubbleProperties(workInProgress);
      break;
    case HostText: {
      // 如果完成的fiber是文本节点，那就创建真实的文本节点
      const newText = newProps;
      //创建真实的DOM几点并传入stateNode
      workInProgress.stateNode = createTextInstance(newText);
      //向上冒泡属性
      bubbleProperties(workInProgress);
      break;
    }
    default:
      break;
  }
}
