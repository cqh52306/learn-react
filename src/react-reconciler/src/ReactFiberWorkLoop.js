import { scheduleCallback } from "scheduler";
import { createWorkInProgress } from "./ReactFiber";
let workInProgress = null;

/**
 * 计划更新root
 * 源码中此处有一个任务的功能
 * @export
 * @param {*} root
 */
export function scheduleUpdateOnFiber(root) {
  // 确保调度执行root上的更新
  ensureRootIsScheduled(root);
}

function ensureRootIsScheduled(root) {
  // 告诉浏览器要执行此函数 performConcurrentWorkOnRoot
  scheduleCallback(performConcurrentWorkOnRoot.bind(null, root));
}

/**
 * 根据fiber构件fiber树，要创建真实的DOM节点，还要把真实的DOM节点插入容器
 *
 * @param {*} root
 */
function performConcurrentWorkOnRoot(root) {
  console.log("performConcurrentWorkOnRoot");
  // 第一次渲染以同步的方式渲染根节点，初次渲染的时候，都是同步的
  renderRootSync(root);
}

function prepareFreshStack(root) {
  workInProgress = createWorkInProgress(root.current, null);
  console.log(workInProgress);
}

function renderRootSync(root) {
  // 开始构件fiber树
  prepareFreshStack(root);
}
