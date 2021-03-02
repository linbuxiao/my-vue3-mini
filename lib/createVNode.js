import { ShapeFlags } from './ShapeFlags.js'

export const createVNode = (type, props, children) => {
  if ( props === void 0 ) { props = {} }

  var vnode = {
    el: null,
    component: null,
    type: type,
    props: props,
    children: children,
    shapeFlag: getShapeFlag(type)
  }
  if (Array.isArray(children)) {
    vnode.shapeFlag |=  ShapeFlags.ARRAY_CHILDREN;
  }
  else if (typeof children === "string") {
    vnode.shapeFlag |= ShapeFlags.TEXT_CHILDREN;
  }  
  return vnode
}

function getShapeFlag(type) {
  return typeof type === "string"
    ? ShapeFlags.ELEMENT
    : ShapeFlags.STATEFUL_COMPONENT;
}

export var h = function(type, props, children) {
  return createVNode(type, props, children)
}