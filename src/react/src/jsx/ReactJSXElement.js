import hasOwnProperty from "shared/hasOwnProperty";
import { REACT_ELEMENT_TYPE } from "shared/ReactSymbols";

// 保留属性
const RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true,
};

function hasValidKey(config) {
  return config.ref !== undefined;
}

function hasValidRef(config) {
  return config.ref !== undefined;
}

const ReactElement = (type, key, ref, props) => {
  // 这就是react元素，也称作虚拟DOM
  const element = {
    $$typeof: REACT_ELEMENT_TYPE,
    type,
    key, // 唯一标识
    ref,
    props,
  };
  return element;
};

export function jsxDEV(type, config) {
  let propName; // 属性名
  const props = {}; // 属性对象
  let key = null; // 每个虚拟DOM可以有一个可选地key属性，用来区分一个父节点下的不同子节点
  let ref = null; // 实现获取真实DOM

  if (hasValidKey(config)) {
    key = config.key;
  }

  if (hasValidRef(config)) {
    ref = config.ref;
  }

  for (propName in config) {
    if (
      hasOwnProperty.call(config, propName) &&
      !RESERVED_PROPS.hasOwnProperty(propName)
    ) {
      props[propName] = config[propName];
    }
  }
  return ReactElement(type, key, ref, props);
}
