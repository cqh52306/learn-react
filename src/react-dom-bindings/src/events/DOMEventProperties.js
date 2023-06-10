import { registerTwoPhaseEvent } from "./EventRegistry";
export const topLevelEventsToReactNames = new Map();
const simpleEventPluginEvents = ["click"];

function registerSimpleEvent(domEventName, reactName) {
  /**
   * onClick在哪可以取到？可以从元素的fiber的属性上可以取到 props.onClick
   * workInProgress.pendingProps=React元素或者说虚拟DOM.props
   * const newProps = workInProgress .pendingProps;
   * 在源码里 让真实DOM元素updateFiberProps(domElement，props);
   * const internalPropsKey ="reactProps$"+ randomKey;
   * 真实DOM元素[internalPropsKey] = props; props.onClick
   * 把原生事件名和处理函数的名字进行映射或者说绑定 click=>onClick */
  topLevelEventsToReactNames.set(domEventName, reactName);
  registerTwoPhaseEvent(reactName, [domEventName]); // 'onClick' ['click']
}

export function registerSimpleEvents() {
  for (let i = 0; i < simpleEventPluginEvents.length; i++) {
    const eventName = simpleEventPluginEvents[i]; // click
    const domEventName = eventName.toLowerCase(); // click
    const capitalizedEvent = eventName[0].toUpperCase() + eventName.slice(1); // Click
    registerSimpleEvent(domEventName, `on${capitalizedEvent}`); // click=>onClick
  }
}
