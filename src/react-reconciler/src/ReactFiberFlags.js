export const NoFlags = 0b00000000000000000000000000; //0
export const Placement = 0b00000000000000000000000010; //2
export const Update = 0b00000000000000000000000100;
export const ChildDeletion = 0b00000000000000000000001000;
export const MutationMask = Placement | Update | ChildDeletion; //4
//如果函数组件的里面使用了useEffect,那么此函数组件对应的fiber上会有一个flags 1024
export const Passive = 0b00000000000000010000000000; // 1024
