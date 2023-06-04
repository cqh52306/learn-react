import { createHostRootFiber } from "./ReactFiber";
import { initializeUpdateQueue } from "./ReactFiberClassUpdateQueue";

// FiberRootNode=containerInfo 其本质就是一个真实的DOM节点 div#root
function FiberRootNode(containerInfo) {
  this.containerInfo = containerInfo;
}

export function createFiberRoot(containerInfo) {
  console.log("containerInfo", containerInfo);
  const root = new FiberRootNode(containerInfo);
  // HostRoot指的就是根节点div#root
  const uninitializedFiber = createHostRootFiber();
  // 根容器的current指向当前的根fiber
  root.current = uninitializedFiber;
  // 根fiber的stateNode，也就是真实DOM节点指向FiberRootNode
  uninitializedFiber.stateNode = root;
  initializeUpdateQueue(uninitializedFiber);
  return root;
}
