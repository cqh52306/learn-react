// 1。 把虚拟DOM构建成fiber树
let A1 = { type: "div", props: { id: "A1" } };
let B1 = { type: "div", props: { id: "B1" }, return: A1 };
let B2 = { type: "div", props: { id: "B2" }, return: A1 };
let C1 = { type: "div", props: { id: "C1" }, return: B1 };
let C2 = { type: "div", props: { id: "C2" }, return: B1 };

// A1的第一个子节点B1
A1.child = B1;
B1.sibling = B2;
B1.child = C1;
C1.sibling = C2;

//下一个工作单元
let nextUnitOfWork = null;
const hasTimeRemaining = () => true;
//render工作循环
function workLoop() {
  debugger;
  // 工作循环每一次处理一个fiber，处理完以后可以暂停
  // 如果下一个任务并且有剩余的时间的话，执行下一个工作单元，也就是一个fiber
  while (nextUnitOfWork && hasTimeRemaining) {
    //执行一个任务并返回下一个任务
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  console.log("render阶段结束");
  //render阶段结束
}
function performUnitOfWork(fiber) {
  let child = beginWork(fiber);
  // 如果执行完A1之后，会返回A1的第一个子节点
  if (child) {
    return child;
  }
  // 如果没有子节点
  while (fiber) {
    //如果没有子节点说明当前节点已经完成了渲染工作
    completeUnitOfWork(fiber); //可以结束此fiber的渲染了
    if (fiber.sibling) {
      //如果它有弟弟就返回弟弟
      return fiber.sibling;
    }
    fiber = fiber.return; //如果没有弟弟让爸爸完成，然后找叔叔
  }
}
function beginWork(fiber) {
  console.log("beginWork", fiber.props.id);
  return fiber.child;
}
function completeUnitOfWork(fiber) {
  console.log("completeUnitOfWork", fiber.props.id);
}
nextUnitOfWork = A1;
workLoop();

// 先执行当前fiber有大儿子执行大儿子没有大儿子执行弟弟如果没有弟弟找叔叔
// 每一个fiber执行完成后都可以放弃执行让浏览器执行更高优先级的任务
// 等浏览器执行完高优先级的任务后再回来执行下一个fiber

// 有两种情况完成一个fiber
// 1没有child,没有大儿子
// 2.所有的儿子已经处理完了，父fiber也会完成
// 怎么完成的?回到父亲不会死循环吗回到父fiber之后，不会执行父fiber,而是会执行父fiber的弟弟
