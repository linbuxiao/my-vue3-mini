
import { h } from './lib/createVNode.js'
// import { ref } from './node_modules/@vue/reactivity/dist/reactivity.esm-browser.js'
import { ref } from './node_modules/@vue/reactivity/dist/reactivity.esm-browser.js'

export default {
  name: "App",
  setup() {
    const count = ref(0);
    const handleClick = () => {
      console.log("click",count.value);
      count.value++;
    };

    return {
      count,
      handleClick,
    };
  },

  render() {
    console.log(this.count);
    return h("div", {}, [
      h("div", {}, String(this.count)),
      h("button", { onClick: this.handleClick }, "click"),
    ]);
  },
};