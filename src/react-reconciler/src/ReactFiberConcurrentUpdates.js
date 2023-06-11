import { HostRoot } from "./ReactWorkTags";
const concurrentQueues = [];
let concurrentQueuesIndex = 0;

export function enqueueConcurrentHookUpdate(fiber, queue, update) {
  enqueueUpdate(fiber, queue, update);
  return getRootForUpdatedFiber(fiber);
}

/**
 * 把更新队列添加到更新队列中
 *
 * @export
 * @param {*} fiber 函数组件对应的fiber
 * @param {*} queue 要更新的hook对应的更新队列
 * @param {*} update 更新对象
 * @param {*} lane
 * @return {*}
 */
export function enqueueConcurrentClassUpdate(fiber, queue, update, lane) {
  enqueueUpdate(fiber, queue, update, lane);
  return getRootForUpdatedFiber(fiber);
}

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

function getRootForUpdatedFiber(sourceFiber) {
  let node = sourceFiber;
  let parent = node.return;
  while (parent !== null) {
    node = parent;
    parent = node.return;
  }
  return node.tag === HostRoot ? node.stateNode : null;
}

/**
 *  把更新先缓存到concurrentQueue数组中
 *
 * @param {*} fiber
 * @param {*} queue
 * @param {*} update
 * @param {*} lane
 */
function enqueueUpdate(fiber, queue, update, lane) {
  //012 setNumber1 345 setNumber2 678 setNumber3
  concurrentQueues[concurrentQueuesIndex++] = fiber;
  concurrentQueues[concurrentQueuesIndex++] = queue;
  concurrentQueues[concurrentQueuesIndex++] = update;
  concurrentQueues[concurrentQueuesIndex++] = lane;
}

export function finishQueueingConcurrentUpdates() {
  const endIndex = concurrentQueuesIndex;
  concurrentQueuesIndex = 0;
  let i = 0;
  while (i < endIndex) {
    const fiber = concurrentQueues[i++];
    const queue = concurrentQueues[i++];
    const update = concurrentQueues[i++];
    const lane = concurrentQueues[i++];
    if (queue !== null && update !== null) {
      const pending = queue.pending;
      if (pending === null) {
        update.next = update;
      } else {
        update.next = pending.next;
        pending.next = update;
      }
      queue.pending = update;
    }
  }
}
