// 根fiber的tag
//每种虚拟DOM都会对应自己的fiber tag类型
export const FunctionComponent = 0; // 函数组件
export const IndeterminateComponent = 2; // 刚开始不知道是函数组件还是类组件 默认值
export const HostRoot = 3; // 容器根节点
export const HostComponent = 5; // 原生节点 span div
export const HostText = 6; // 纯文本节点
