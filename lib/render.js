import { ShapeFlags } from './ShapeFlags.js'
import { processComponent } from './processComponent.js'
import { processElement } from './processElement.js'

export const render = (vnode, container) => {
  patch(null, vnode, container)
}

// 这一层主要是根据vnode的类型，进行第一次分发
export function patch(n1, n2, container=null, parentComponent=null) {
  console.log('进入patch',n2);
  const { type, shapeFlag } = n2;
  switch (type) {
    case "text":
      // todo
      break;
  
    default:
      // 其实这里是一个判等的操作。 1&1 = 1， 1&2 = 0。是个锤子
      // 这里是运用位运算 里的 与 和 或 运算符做出的判断
      if(shapeFlag&ShapeFlags.ELEMENT) {
        console.log("处理element");
        /**
         * 之所以一个简单的组件（代指只有一个元素的组件），需要走两遍这个流程才开始处理element。
         * 答案很简单是因为，第一次他不知道你只有一个元素
         */
        processElement(n1, n2, container)
      } 
      else if( shapeFlag&ShapeFlags.STATEFUL_COMPONENT ) {
        console.log("处理component");
        // 这一层的参数完全继承了patch的参数
        processComponent(n1, n2, container, parentComponent);
      }  
    }
}