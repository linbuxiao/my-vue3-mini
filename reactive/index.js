/**
 * ref实现
 */

let currentEffect
class Dep {
  constructor(val) {
    this.effects = new Set()
    this._val = val
  }

  get value() {
    this.depend()
    return this._val
  }
  set value(newVal) {
    this._val = newVal
    this.notice()
  }
  // 收集依赖
  depend() {
    if (currentEffect) {
      this.effects.add(currentEffect)
    }
  }

  // 触发依赖
  notice() {
    this.effects.forEach((effect)=> {
      effect()
    })
  }
}

function effect(effect) {
  // 收集依赖
  currentEffect = effect
  effect()
  currentEffect = null
}

function ref(raw) {
  return new Dep(raw)
}

/**
 * reactive实现
 */
const targetMap = new Map()

function getDep(target, key) {
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }  

  return dep
}

const proxyHandler = {
  get: function (target, key) {
    const dep = getDep(target, key)
    dep.depend()
    return Reflect.get(target, key)
  },
  set: function (target, key, val) {
    // 获取dep
    const dep = getDep(target, key)
    const result = Reflect.set(target, key, val)
    dep.notice()
    return result
  }
}

function reactive(raw) {
  return new Proxy(raw, proxyHandler)
}


export {
  ref,
  effect,
  reactive
}
