import ReactCurrentDispatcher from "./ReactCurrentDispatcher";

function resolveDispatcher() {
  const dispatcher = ReactCurrentDispatcher.current;
  return dispatcher;
}

/**
 *
 *
 * @export
 * @param {*} reducer 处理函数，用于根据老状态和动作计算新状态
 * @param {*} initialArg 初始状态
 * @param {*} init
 * @return {*}
 */
export function useReducer(reducer, initialArg, init) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useReducer(reducer, initialArg, init);
}

export function useState(initialState) {
  const dispatcher = resolveDispatcher();
  return dispatcher.useState(initialState);
}
