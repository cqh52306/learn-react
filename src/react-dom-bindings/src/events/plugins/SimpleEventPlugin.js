import {
  registerSimpleEvents,
  topLevelEventsToReactNames,
} from "../DOMEventProperties";
import { SyntheticMouseEvent } from "../SyntheticEvent";
import { IS_CAPTURE_PHASE } from "../EventSystemFlags";
import { accumulateSinglePhaseListeners } from "../DOMPluginEventSystem";

/**
 * 把要执行回调函数添加到dispatchQueue中
 *
 * @param {*} dispatchQueue 派发队列，里面放置我们的监听函数
 * @param {*} domEventName DOM事件名 click
 * @param {*} targetInst 目标fiber
 * @param {*} nativeEvent 原生事件
 * @param {*} nativeEventTarget 原生事件源
 * @param {*} eventSystemFlags 事件系统标识 0冒泡 4捕获
 */
function extractEvents(
  dispatchQueue,
  domEventName,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags
) {
  const reactName = topLevelEventsToReactNames.get(domEventName); // click=>onClick
  let SyntheticEventCtor; // 合成事件的构建函数
  switch (domEventName) {
    case "click":
      SyntheticEventCtor = SyntheticMouseEvent;
      break;
    default:
      break;
  }
  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0; // 是否是捕获阶段
  const listeners = accumulateSinglePhaseListeners(
    targetInst,
    reactName,
    nativeEvent.type,
    inCapturePhase
  );
  console.log(listeners.length);
  // 如果有要执行的监听函数的话[onclickCapture,onclickCapture]=[ChildCapture,ParentCapture]
  if (listeners.length > 0) {
    const event = new SyntheticEventCtor(
      reactName,
      domEventName,
      targetInst,
      nativeEvent,
      nativeEventTarget
    );
    dispatchQueue.push({
      event, // 合成事件实例
      listeners, // 监听函数数组
    });
  }
}

export { registerSimpleEvents as registerEvents, extractEvents };
