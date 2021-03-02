const EMPTY_OBJ = Object.freeze({})
const effectStack = [];
const trackStack = [];
let shouldTrack = true;
let activeEffect;

let uid = 0;

function createReactiveEffect(fn, options) {
  const effect = function reactiveEffect() {  
      // 因为effect.active在下方赋值为true，所以下方的判断不会进入  
      if (!effect.active) {
          return options.scheduler ? undefined : fn();
      }

      // 这一步 其实是一个清洁队列的方式
      if (!effectStack.includes(effect)) {
          cleanup(effect);
          try {
              enableTracking();
              effectStack.push(effect);
              activeEffect = effect;
              return fn();
          }
          finally {
              effectStack.pop();
              resetTracking();
              activeEffect = effectStack[effectStack.length - 1];
          }
      }
  };
  effect.id = uid++;
  effect.allowRecurse = !!options.allowRecurse;
  effect._isEffect = true;
  effect.active = true;
  effect.raw = fn;
  effect.deps = [];
  effect.options = options;
  return effect;
}

function cleanup(effect) {
  const { deps } = effect;
  if (deps.length) {
      for (let i = 0; i < deps.length; i++) {
          deps[i].delete(effect);
      }
      deps.length = 0;
  }
}

function resetTracking() {
  const last = trackStack.pop();
  shouldTrack = last === undefined ? true : last;
}

// 启用追踪
function enableTracking() {
  trackStack.push(shouldTrack);
  shouldTrack = true;
}

export function effect(fn, options = EMPTY_OBJ) {
  if(fn && fn._isEffect === true) {
    fn = fn.raw
  }

  const effect = createReactiveEffect(fn, options)
  if(!options.lazy) {
    effect()
  } 

  // 最后打印这些依赖项，发现都没有变化
  return effect
}

// 更新队列
var queue = [];
var isFlushPending = false;
var p = Promise.resolve();
export function queueJob(job) {
  if (!queue.includes(job)) {
      queue.push(job);
      queueFlush();
  }
}

function queueFlush() {
  if (isFlushPending)
      return;
  isFlushPending = true;
  nextTick(flushJobs);
}

function nextTick(fn) {
  return fn ? p.then(fn) : p;
}

function flushJobs() {
  isFlushPending = false;
  var job;
  while ((job = queue.shift())) {
      if (job) {
          job();
      }
  }
}