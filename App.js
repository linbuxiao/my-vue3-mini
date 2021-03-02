import { h } from './lib/createVNode.js'

const Helloworld = {
  render() {
    return h("div", {tId: 1}, 'Helloworld')
  }
}

export default {
  name: "App",
  
  render() {
    return h("div", { tId: 1 }, [h("p", {}, '主页'), h(Helloworld)]);
  },
};