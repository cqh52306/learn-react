import { scheduleCallback } from "scheduler";
import { createWorkInProgress } from "./ReactFiber";
import { beginWork } from "./ReactFiberBeginWork";
import { completeWork } from "./ReactFiberCompleteWork";
import {
  MutationMask,
  NoFlags,
  Placement,
  Update,
  ChildDeletion,
} from "./ReactFiberFlags";
import { commitMutationEffectsOnFiber } from "./ReactFiberCommitWork";
import { finishQueueingConcurrentUpdates } from "./ReactFiberConcurrentUpdates";
import {
  HostComponent,
  HostRoot,
  HostText,
  FunctionComponent,
} from "./ReactWorkTags";
let workInProgress = null;
let workInProgressRoot = null;

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
  if (workInProgressRoot) return;
  workInProgressRoot = root;
  console.log("ensureRootIsScheduled");
  // 告诉浏览器要执行此函数 performConcurrentWorkOnRoot
  scheduleCallback(performConcurrentWorkOnRoot.bind(null, root));
}

/**
 * 根据fiber构件fiber树，要创建真实的DOM节点，还要把真实的DOM节点插入容器
 *
 * @param {*} root
 */
function performConcurrentWorkOnRoot(root) {
  // 第一次渲染以同步的方式渲染根节点，初次渲染的时候，都是同步的
  renderRootSync(root);
  console.log("root", root);
  // 开始进入提交阶段，就是执行副作用，修改真实DOM
  const finishedWork = root.current.alternate;
  printFiber(finishedWork);
  console.log(`~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
  root.finishedWork = finishedWork;
  commitRoot(root);
  workInProgressRoot = null;
}

function commitRoot(root) {
  const { finishedWork } = root;
  printFinishedWork(finishedWork);
  console.log(`~~~~~~~~~~~~~~~~~~~~~2~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~`);
  // 判断子树有没有副作用
  const subtreeHasEffects =
    (finishedWork.subtreeFlags & MutationMask) !== NoFlags;
  const rootHasEffect = (finishedWork.flags & MutationMask) !== NoFlags;
  // 如果自己的副作用或者子节点有副作用就进行提交DOM操作
  if (subtreeHasEffects || rootHasEffect) {
    console.log("commitRoot", finishedWork.child);
    commitMutationEffectsOnFiber(finishedWork, root);
  }
  // 等DOM变更后，就可以让root的current指向新的fiber树
  root.current = finishedWork;
}
function printFiber(fiber) {
  /*
    fiber.flags &= ~Forked;
    fiber.flags &= ~PlacementDEV;
    fiber.flags &= ~Snapshot;
    fiber.flags &= ~PerformedWork;
    */
  if (fiber.flags !== 0) {
    // console.log(
    //   getFlags(fiber.flags),
    //   getTag(fiber.tag),
    //   typeof fiber.type === "function" ? fiber.type.name : fiber.type,
    //   fiber.memoizedProps
    // );
    if (fiber.deletions) {
      for (let i = 0; i < fiber.deletions.length; i) {
        const childToDelete = fiber.deletions[i];
        console.log(
          getTag(childToDelete.tag),
          childToDelete.type,
          childToDelete.memoizedProps
        );
      }
    }
  }
  let child = fiber.child;
  while (child) {
    printFiber(child);
    child = child.sibling;
  }
}
function getTag(tag) {
  switch (tag) {
    case FunctionComponent:
      return `FunctionComponent`;
    case HostRoot:
      return `HostRoot`;
    case HostComponent:
      return `HostComponent`;
    case HostText:
      return HostText;
    default:
      return tag;
  }
}
function getFlags(flags) {
  if (flags === (Update | Placement | ChildDeletion)) {
    return `自己移动和子元素有删除`;
  }
  if (flags === (ChildDeletion | Update)) {
    return `自己有更新和子元素有删除`;
  }
  if (flags === ChildDeletion) {
    return `子元素有删除`;
  }
  if (flags === (Placement | Update)) {
    return `移动并更新`;
  }
  if (flags === Placement) {
    return `插入`;
  }
  if (flags === Update) {
    return `更新`;
  }
  return flags;
}

function prepareFreshStack(root) {
  workInProgress = createWorkInProgress(root.current, null);
  finishQueueingConcurrentUpdates();
}

function renderRootSync(root) {
  // 开始构件fiber树
  prepareFreshStack(root);
  workLoopSync();
}

function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress);
  }
}

/**
 * 执行一个工作单元
 *
 * @param {*} unitOfWork
 */
function performUnitOfWork(unitOfWork) {
  // 获取新fiber对应的老fiber
  const current = unitOfWork.alternate;
  // 完成当前fiber的子fiber链表构建后
  const next = beginWork(current, unitOfWork);
  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null) {
    // 如果没有子几点表示当前的fiber已经结束
    completeUnitOfWork(unitOfWork);
  } else {
    // 如果有子节点，就让自己点成为下一个工作单元
    workInProgress = next;
  }
}

function completeUnitOfWork(unitOfWork) {
  let completedWork = unitOfWork;
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    // 执行此fiber的完成工作，如果是原生组件的话就是创建真实的DOM节点
    completeWork(current, completedWork);
    // 如果有弟弟，就构建弟弟对应的fiber子链表
    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      workInProgress = siblingFiber;
      return;
    }
    // 如果没有弟弟，说明这当前完成的就是父fiber的最后一个节点
    // 也就是说一个父fiber，所有的子fiber全部完成了
    completedWork = returnFiber;
    workInProgress = completedWork;
  } while (completedWork !== null);
}

function printFinishedWork(fiber) {
  let child = fiber.child;
  while (child) {
    printFinishedWork(child);
    child = child.sibling;
  }
  if (fiber.flags !== 0) {
    console.log(
      getFlags(fiber.flags),
      getTag(fiber.tag),
      fiber.type.name,
      fiber.memoizedProps
    );
  }
}
