import {
  ImmediatePriority,
  UserBlockingPriority,
  NormalPriority,
  LowPriority,
  IdlePriority,
} from "../SchedulerPriorities";
import { push, pop, peek } from "../SchedulerMinHeap";
import { frameYieldMs } from "../SchedulerFeatureFlags";

const maxSigned31BitInt = 1073741823;
// Times out immediately 立刻过期 -1
const IMMEDIATE_PRIORITY_TIMEOUT = -1;
// Eventually times out 250毫秒
const USER_BLOCKING_PRIORITY_TIMEOUT = 250;
// 正常优先级的过期时间 5秒
const NORMAL_PRIORITY_TIMEOUT = 5000;
// 低优先级过期时间 1e秒
const LOW_PRIORITY_TIMEOUT = 10000;
// Never times out 永远不过期
const IDLE_PRIORITY_TIMEOUT = maxSigned31BitInt;

// 任务最小堆
const taskQueue = [];
// 任务ID计数器
let taskIdCounter = 1;
let scheduledHostCallback = null;
let startTime = -1;
let currentTask = null;
//React每一·顺向浏览申请5毫秒用于自己任务执行
//如果5MS内没有完成，React也会放弃控制权，把控制交还给浏览器
const frameInterval = frameYieldMs;
const channel = new MessageChannel();
const port = channel.port2;

const getCurrentTime = () => performance.now();
channel.port1.onmessage = performWorkUntilDeadline;

function schedulePerformWorkUntilDeadline() {
  port.postMessage(null);
}

function performWorkUntilDeadline() {
  if (scheduledHostCallback !== null) {
    // 先获取开始执行任务的时间
    // 表示时间片开始
    startTime = getCurrentTime();
    // 是否有更多的工作要做
    let hasMoreWork = true;
    try {
      //执行 flushWork ，并判断有没有返回值
      hasMoreWork = scheduledHostCallback(startTime);
    } finally {
      //执行完以后如果为true,说明还有更多工作要做
      if (hasMoreWork) {
        //继续执行
        schedulePerformWorkUntilDeadline();
      } else {
        scheduledHostCallback = null;
      }
    }
  }
}
function requestHostCallback(callback) {
  //先缓存回调函数
  scheduledHostCallback = callback;
  //执行工作直到截止时间
  schedulePerformWorkUntilDeadline();
}

/**
 *  执行优先级任务
 *
 * @param {*} priorityLevel
 * @param {*} callback
 * @return {*}
 */
function unstable_scheduleCallback(priorityLevel, callback) {
  //获取当前时间
  const currentTime = getCurrentTime();
  //此任务开始时间
  const startTime = currentTime;
  //超时时间
  let timeout;
  switch (priorityLevel) {
    case ImmediatePriority:
      timeout = IMMEDIATE_PRIORITY_TIMEOUT;
      break;
    case UserBlockingPriority:
      timeout = USER_BLOCKING_PRIORITY_TIMEOUT;
      break;
    case IdlePriority:
      timeout = IDLE_PRIORITY_TIMEOUT;
      break;
    case LowPriority:
      timeout = LOW_PRIORITY_TIMEOUT;
      break;
    case NormalPriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT;
      break;
  }
  // 计算任务过期时间
  const expirationTime = startTime + timeout;
  const newTask = {
    id: taskIdCounter++,
    callback, //回调函数或者任务函数
    priorityLevel, //优先级别
    startTime, //任务开始时间
    expirationTime, //任务过期时间
    sortIndex: -1, //排序
  };
  newTask.sortIndex = expirationTime;
  //向任务最小堆里添加任务，排序的依据是过期时间
  push(taskQueue, newTask);
  //flushWork执行工作，刷新工作，执行任务，司机接人
  requestHostCallback(flushWork);
  return newTask;
}

/**
 * 开始执行任务队列中的任务
 *
 * @param {*} initialTime
 * @return {*}
 */
function flushWork(initialTime) {
  return workLoop(initialTime);
}

function shouldYieldToHost() {
  //用当前时间减去开始的时间就是过去的时间
  const timeElapsed = getCurrentTime() - startTime;
  //如果流逝或者说经过的时间小于5毫秒，那就不需要放弃执行
  if (timeElapsed < frameInterval) {
    return false;
  }
  //否则就是表示5毫秒用完了，需要放弃执行
  return true;
}

function workLoop(initialTime) {
  let currentTime = initialTime;
  //取出优先级最高的任务
  currentTask = peek(taskQueue);
  while (currentTask !== null) {
    //如果此任务的过期时间小于当前时间，也就是说没有过期,并且需要放弃执行 时间片到期
    if (currentTask.expirationTime > currentTime && shouldYieldToHost()) {
      //跳出工作循环
      break;
    }
    //取出当前的任务中的回调函数 performConcurrentWorkOnRoot
    const callback = currentTask.callback;
    if (typeof callback === "function") {
      currentTask.callback = null;

      const didUserCallbackTimeout = currentTask.expirationTime <= currentTime;
      //执行工作，如果返回新的函数，则表示当前的工作没有完成
      const continuationCallback = callback(didUserCallbackTimeout);
      currentTime = getCurrentTime();
      if (typeof continuationCallback === "function") {
        currentTask.callback = continuationCallback;
        return true; //还有任务要执行
      }
      // 如果此任务已经完成，则不需要再继续执行了，可以把此任务弹出
      if (currentTask === peek(taskQueue)) {
        pop(taskQueue);
      }
    } else {
      pop(taskQueue);
    }
    //如果当前的任务执行完了，或者当前任务不合法，取出下一个任务执行
    currentTask = peek(taskQueue);
  }
  //如果循环结束还有未完成的任务 那就表示hasMoreWork=true
  if (currentTask !== null) {
    return true;
  }
  //没有任何要完成的任务了
  return false;
}

function unstable_cancelCallback(task) {
  task.callback = null;
}

export {
  NormalPriority as unstable_NormalPriority,
  unstable_scheduleCallback,
  shouldYieldToHost as unstable_shouldYield,
  unstable_cancelCallback,
  getCurrentTime as unstable_now,
};
