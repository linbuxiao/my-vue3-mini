import { ref, effect, reactive } from './index.js'
// var a = ref(10)
// let b
// effect(()=> {
//   b = a.value + 100
//   console.log(b);
// })

// a.value = 20

// var n = reactive({
//   value: 50
// })
// let m
// effect(()=> {
//   m = n.value + 50
//   console.log(m);
// })

// n.value = 200

function createApp(rootComponent) {
  const app = {
    mount: function (rootContainer) {
      const context = rootComponent.setup()
      let isMounted = false
      let prevSubTree
      effect(()=> {
        if (!isMounted) {
          const subTree = rootComponent.render(context)
          mountElement(subTree, rootContainer)
          isMounted = true
          prevSubTree = subTree
        } else {
          const subTree = rootComponent.render(context)
          diff(prevSubTree, subTree)
          prevSubTree = subTree
        }
        
      })
    }
  }

  return app
}


function diff(n1, n2) {
  /**
   * tag, props, children
   */
  if (n1.tag !== n2.tag) {
    n1.el.replaceWith(document.createElement(n2.tag))
  } else {
    const el = n2.el = n1.el
    const { props: newProps } = n2
    const { props: oldProps } = n1

    if (newProps && oldProps) {
      Object.keys(newProps).forEach(key=> {
        const newVal = newProps[key]
        const oldVal = oldProps[key]

        if (newVal !== oldVal) {
          el.setAttribute(key, newVal)
        }
      })
    }

    if (oldProps) {
      Object.keys(oldProps).forEach(key=> {
        if(!newProps[key]) {
          el.removeAttribute(key)
        }
      })
    }


    const { children: newChildren = [] } = n2
    const { children: oldChildren = [] } = n1

    if (typeof newChildren === "string") {
      if (typeof oldChildren === "string") {
        if (newChildren !== oldChildren) {
          el.textContent = newChildren 
        }
      } else if(Array.isArray(oldChildren)) {
        el.textContent = newChildren 
      }
    } else if(Array.isArray(newChildren)){
      if (typeof oldChildren === "string") {
        el.innerText = ``
        mountElement(n2, el)
      } else if (Array.isArray(oldChildren)) {
        const length = Math.min(newChildren.length, oldChildren.length)
        for (let index = 0; index<length; index++) {
          const newVNode = newChildren[index]
          const oldVNode = oldChildren[index]
          diff(oldVNode, newVNode)
        }
      }
    }
  }
}

function h(tag, props, children) {
  return {
    tag,
    props,
    children
  }
}

function mountElement(vnode, container) {
  const { tag, props, children } = vnode
  var el = (vnode.el = document.createElement(String(tag)))

  if (props) {
    for (const key in props) {
      const val = props[key]
      if (key === "onClick") {
        el.addEventListener('click', val)
      } else {
        el.setAttribute(key, val)
      }
    }
  }

  if(typeof children === "string") {
    const textNode = document.createTextNode(children)
    el.append(textNode)
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      mountElement(child, el)
    })
  }
  
  container.append(el)
}

const App = {
  render(context) {
    return h(
      "div", 
      {
        id: `app-${context.state.count}`,
        class: "show",
        'onClick': context.handleClick
      }, [h("p", null, "hello"), h("p", null, String(context.state.count))])
  },
  setup () {
    const state = reactive({
      count: 0
    })

    const handleClick = () => {
      state.count ++
    }

    return {
      state, 
      handleClick
    }
  }
}

createApp(App).mount(document.getElementById("root"))


