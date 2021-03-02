import { emit, PublicInstanceProxyHandlers } from './utils.js'
import { proxyRefs } from '../reactive/ref.js'
import { queueJob } from './effect.js'
import { effect } from '../reactivity.esm-browser.prod.js'
import { patch } from './render.js'

export function processComponent(n1, n2, container, parentComponent) {
  if(!n1) {
    console.log("初始化component");
    // 再次传递参数, 因为n1为null， 则只传递n2， n2为初始的VNode
    mountComponent(n2, container, parentComponent);
  } else {
    console.log("todo");
    updateComponent(n1, n2, container);    
  }
}

function mountComponent(initialVNode, container, parentComponent) {
  // 新建原型
  // 将n2中的component挂载为component原型
  var instance = (initialVNode.component = createComponentInstance(initialVNode, parentComponent));  
  setupComponent(instance);
  setupRenderEffect(instance, container)
}

function createComponentInstance(vnode, parent) {
  var instance = {
    type: vnode.type,
    vnode: vnode,
    parent: parent,
    proxy: null,
    isMounted: false,
    attrs: {},
    slots: {},
    ctx: {},
    setupState: {},
    emit: function () {}
  }
  // 把原型自身挂载到ctx上
  instance.ctx = {
    _: instance
  }
  
  instance.emit = emit.bind(null, instance)
  return instance
}

function setupComponent(instance) {
  // 进行setup一系列的初始化
  instance.props = instance.vnode.props
  // initSlots();
  // 赋予响应式？
  setupStatefulComponent(instance);  
}

function setupStatefulComponent(instance) {
  // 这里我们数据劫持的对象是instance中的ctx
  instance.proxy = new Proxy(instance.ctx, PublicInstanceProxyHandlers)
  var Component = instance.type
  var setup = Component.setup
  if (setup) {
    setCurrentInstance(instance)
    var setupContext = {
      attrs: instance.attrs,
      slots: instance.slots,
      emit: instance.emit,
      expose: function () { },      
    }
    var setupResult = setup && setup(instance.props, setupContext);
    setCurrentInstance(null);
    if (typeof setupResult === "function") {
        instance.render = setupResult;
    }
    else if (typeof setupResult === "object") {
        instance.setupState = proxyRefs(setupResult);
    }
    var Component = instance.type;
    if (!instance.render) {
        instance.render = Component.render;
    }
  }
}

function setupRenderEffect(instance, container) {
  instance.update = effect(function componentEffect() {
    if( !instance.isMounted ) {
      const proxyToUse = instance.proxy
      const subTree = (instance.subTree = instance.render.call(proxyToUse, proxyToUse))
      console.log('suabTree:',subTree);
      console.log(instance.type.name + ":\u89E6\u53D1 beforeMount hook");
      console.log(instance.type.name + ":\u89E6\u53D1 onVnodeBeforeMount hook");
      patch(null, subTree, container, instance);
      console.log(instance.type.name + ":\u89E6\u53D1 mounted hook");
      instance.isMounted = true;
    }
    else {
      console.log("更新开始！");
      const proxyToUse = instance.proxy
      const nextTree = instance.render.call(proxyToUse, proxyToUse)
      const prevTree = instance.subTree
      instance.subTree = nextTree
      console.log("beforeUpdated hook");
      console.log("onVnodeBeforeUpdate hook");
      patch(prevTree, nextTree, prevTree.el, instance)
      console.log("updated hook");
      console.log("onVnodeUpdated hook");
    }
  },{
    scheduler: function (effect) {
      queueJob(effect);
    },    
  })
}

var currentInstance = {};
function setCurrentInstance(instance) {
  currentInstance = instance;
}