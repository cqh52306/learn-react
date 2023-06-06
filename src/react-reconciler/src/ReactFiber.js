import { HostRoot } from "./ReactWorkTags";
import { NoFlags } from "./ReactFiberFlags";

/**
 *
 * @export
 * @param {*} tag fiber的类型 函数组件0 类组件1 原生组件5 根组件3
 * @param {*} pendingProps 新属性，等待处理或者生效的属性
 * @param {*} key 唯一标识
 */
export function FiberNode(tag, pendingProps, key) {
  this.tag = tag;
  this.key = key;
  this.type = null; // fiber类型，来自于 虚拟DOM节点的type 例如span div
  // 每个虚拟DOM=>Fiber节点=>真实DOM
  this.stateNode = null; // 此fiber对应的真实DOM节点 h1=>真实的h1DOM

  this.return = null; // 指向父节点
  this.child = null; // 指向第一个子节点
  this.sibling = null; //指向弟弟

  // fiber哪来的？通过虚拟DOM节点创建，虚拟DOM会提供pendingProps用来创建fiber节点的属性
  this.pendingProps = pendingProps; // 等待生效的属性
  this.memoizedProps = null; // 已经生效的属性
  // 每个fiber身上可能还有更新队列
  this.updateQueue = null;

  // 每个fiber还会有自己的状态，每一种fiber状态类型都是不一样的
  // 类组件对应的fiber 存在的就是类的实例的状态，HostRoot存在的就是要渲染的元素
  this.memoizedState = null;

  // 自己的副作用标识，表示要针对此fiber节点进行何种操作
  this.flags = NoFlags;
  // 自己点对应的副作用标识
  this.subtreeFlags = NoFlags;
  // 轮替
  this.alternate = null;
}
function createFiber(tag, pendingProps, key) {
  return new FiberNode(tag, pendingProps, key);
}
export function createHostRootFiber() {
  return createFiber(HostRoot, null, null);
}

// We use a double buffering pooling technique because we know that we'll
// only ever need at most two versions of a tree. We pool the "other" unused
// node that we're free to reuse. This is lazily created to avoid allocating
// extra objects for things that are never updated. It also allow us to
// reclaim the extra memory if needed.
//我们使用双缓冲池技术，因为我们知道一棵树最多只需要两个版本
//我们将“其他”未使用的我们可以自由重用的节点
//这是延迟创建的，以避免分配从未更新的内容的额外对象。它还允许我们如果需要，回收额外的内存
export function createWorkInProgress(current, pendingProps) {
  let workInProgress = current.alternate;
  if (workInProgress === null) {
    workInProgress = createFiber(current.tag, pendingProps, current.key);
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  } else {
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
  }
  workInProgress.child = current.child;
  workInProgress.memoizedProps = current.memoizedProps;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.sibling = current.sibling;
  workInProgress.index = current.index;
  return workInProgress;
}
