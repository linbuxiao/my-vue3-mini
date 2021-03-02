import { ShapeFlags } from "./ShapeFlags.js"
import { patch } from './render.js'

export function processElement(n1, n2, container) {
  if (!n1) {
    mountElement(n2, container)
  } else {
    updateElement(n1, n2)
  }
}

function mountElement(vnode, container) {
  var { shapeFlag, props } = vnode
  var el = (vnode.el = document.createElement(vnode.type))
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    console.log("\u5904\u7406\u6587\u672C:" + vnode.children);
    el.innerText = vnode.children
    
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    vnode.children.forEach(function (VNodeChild) {
        console.log("mountChildren:", VNodeChild);
        patch(null, VNodeChild, container);
    });
  }
  if (props) {
      for (var key in props) {
          var nextVal = props[key];                 
          hostPatchProp(el, key, null, nextVal);
      }
  }
  // console.log("vnodeHook  -> onVnodeBeforeMount");
  // console.log("DirectiveHook  -> beforeMount");
  // console.log("transition  -> beforeEnter");
  hostInsert(el, container);
  // console.log("vnodeHook  -> onVnodeMounted");
  // console.log("DirectiveHook  -> mounted");
  // console.log("transition  -> enter");
}

function hostInsert(child, parent, anchor) {
  if (anchor === void 0) { anchor = null }
  console.log("hostInsert");
  if (anchor) {
    parent.insertBefor(child, anchor)
  }
  else {
    parent.appendChild(child)
  }
}


function updateElement(n1, n2, container) {
  const oldProps = (n1 && n1.props) || {}
  const newProps = n2.props || {}
  console.log("应该更新 element");
  console.log("旧的 vnode", n1);
  console.log("新的 vnode", n2);  
  const el = (n2.el = n1.el)
  patchProps(el, oldProps, newProps)
  patchChildren(n1, n2, el)
}


function patchProps(el, oldProps, newProps) {
  for (var key in newProps) {
    const prevProp = oldProps[key]
    const nextProp = newProps[key]
    if (prevProp !== nextProp) {
      hostPatchProp(el, key, prevProp, nextProp)
    } 
  }

  for (var key in oldProps) {
    const prevProp = oldProps[key]
    const nextProp = null
    if (!(key in newProps)) {
      hostPatchProp(el, key, prevProp, nextProp)
    }
  }
}

// 对比改变的参数
function hostPatchProp(el, key, preValue, nextValue) {
  console.log("hostPatchProp \u8BBE\u7F6E\u5C5E\u6027:" + key + " \u503C:" + nextValue);
  console.log("key: " + key + " \u4E4B\u524D\u7684\u503C\u662F:" + preValue);
  switch (key) {
    case "id":
    case "tId" :
      if (nextValue === null || nextValue === undefined ) {
        el.removeAttribute(key)
      }
      else {
        el.setAttribute(key, nextValue)
      }
      break;
    case "onClick":
      el.addEventListener("click", nextValue)
    default:
      break;
  }  
}

function patchChildren(n1, n2, container) {
  const prevShapeFlag = n1.shapeFlag,
        c1 = n1.children
  const shapeFlag = n2.shapeFlag,
        c2 = n2.children
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    if (c2 !== c1) {
      console.log("类型为 text_children, 当前需要更新");
      container.innerText = c2
    }
  }
  // 递归
  else {
    if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        patchKeyedChildren(c1, c2, container)
      }
    }
  }
}

function patchKeyedChildren(c1, c2, container) {
  var i = 0
  var e1 = c1.length - 1
  var e2 = c2.length - 1
  var isSameVNodeType = function (n1, n2) {
    return n1.type === n2.type && n1.key === n2.key
  }

  while (i<= e1 && i <= e2) {
    var prevChild = c1[i]
    var nextChild = c2[i]
    if (!isSameVNodeType(prevChild, nextChild)) {
      console.log("两个 child 不相等(从左往右比对)");
      console.log("prevChild:" + prevChild);
      console.log("nextChild:" + nextChild);
      break      
    }
    console.log("两个 child 相等，接下来对比着两个 child 节点(从左往右比对)");
    patch(prevChild, nextChild, container)
    i++
  }
}