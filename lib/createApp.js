import { createVNode } from './createVNode.js'
import { render } from './render.js'

export const createApp = (rootComponent) => {
  var app = {
    mount: function (rootcontainer) {
      var vnode = createVNode(rootComponent)
      render(vnode, rootcontainer)
    }
  }

  return app
}