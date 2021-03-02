let shouldTrack = true;
let activeEffect;
export function ref(value) {
  return createRef(value);
}
const hasChanged = (value, oldValue) => value !== oldValue && (value === value || oldValue === oldValue);
function createRef(rawValue, shallow = false) {
  if (isRef(rawValue)) {
      return rawValue;
  }
  return new RefImpl(rawValue, shallow);
}

function isRef(r) {
  return Boolean(r && r.__v_isRef === true);
}
function unref(ref) {
  return isRef(ref) ? ref.value : ref;
}
const convert = (val) => isObject(val) ? reactive(val) : val;
const isObject = (val) => val !== null && typeof val === 'object';
function toRaw(observed) {
  return ((observed && toRaw(observed["__v_raw" /* RAW */])) || observed);
}
class RefImpl {
  constructor(_rawValue, _shallow = false) {
      this._rawValue = _rawValue;
      this._shallow = _shallow;
      this.__v_isRef = true;
      this._value = _shallow ? _rawValue : convert(_rawValue);
  }
  get value() {
      track(toRaw(this), "get" /* GET */, 'value');
      return this._value;
  }
  set value(newVal) {
      if (hasChanged(toRaw(newVal), this._rawValue)) {
          this._rawValue = newVal;
          this._value = this._shallow ? newVal : convert(newVal);
          trigger(toRaw(this), "set" /* SET */, 'value', newVal);
      }
  }
}

export function proxyRefs(objectWithRefs) {
  return isReactive(objectWithRefs)
      ? objectWithRefs
      : new Proxy(objectWithRefs, shallowUnwrapHandlers);
}

function isReactive(value) {
  if (isReadonly(value)) {
      return isReactive(value["__v_raw" /* RAW */]);
  }
  return !!(value && value["__v_isReactive" /* IS_REACTIVE */]);
}

function isReadonly(value) {
  return !!(value && value["__v_isReadonly" /* IS_READONLY */]);
}

const shallowUnwrapHandlers = {
  get: (target, key, receiver) => unref(Reflect.get(target, key, receiver)),
  set: (target, key, value, receiver) => {
      const oldValue = target[key];
      if (isRef(oldValue) && !isRef(value)) {
          oldValue.value = value;
          return true;
      }
      else {
          return Reflect.set(target, key, value, receiver);
      }
  }
};

function track(target, type, key) {
  if (!shouldTrack || activeEffect === undefined) {
      return;
  }
  let depsMap = targetMap.get(target);
  if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
  }
  let dep = depsMap.get(key);
  if (!dep) {
      depsMap.set(key, (dep = new Set()));
  }
  if (!dep.has(activeEffect)) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
      if (activeEffect.options.onTrack) {
          activeEffect.options.onTrack({
              effect: activeEffect,
              target,
              type,
              key
          });
      }
  }
}

function trigger(target, type, key, newValue, oldValue, oldTarget) {
  const depsMap = targetMap.get(target);
  if (!depsMap) {
      // never been tracked
      return;
  }
  const effects = new Set();
  const add = (effectsToAdd) => {
      if (effectsToAdd) {
          effectsToAdd.forEach(effect => {
              if (effect !== activeEffect || effect.allowRecurse) {
                  effects.add(effect);
              }
          });
      }
  };
  if (type === "clear" /* CLEAR */) {
      // collection being cleared
      // trigger all effects for target
      depsMap.forEach(add);
  }
  else if (key === 'length' && isArray(target)) {
      depsMap.forEach((dep, key) => {
          if (key === 'length' || key >= newValue) {
              add(dep);
          }
      });
  }
  else {
      // schedule runs for SET | ADD | DELETE
      if (key !== void 0) {
          add(depsMap.get(key));
      }
      // also run for iteration key on ADD | DELETE | Map.SET
      switch (type) {
          case "add" /* ADD */:
              if (!isArray(target)) {
                  add(depsMap.get(ITERATE_KEY));
                  if (isMap(target)) {
                      add(depsMap.get(MAP_KEY_ITERATE_KEY));
                  }
              }
              else if (isIntegerKey(key)) {
                  // new index added to array -> length changes
                  add(depsMap.get('length'));
              }
              break;
          case "delete" /* DELETE */:
              if (!isArray(target)) {
                  add(depsMap.get(ITERATE_KEY));
                  if (isMap(target)) {
                      add(depsMap.get(MAP_KEY_ITERATE_KEY));
                  }
              }
              break;
          case "set" /* SET */:
              if (isMap(target)) {
                  add(depsMap.get(ITERATE_KEY));
              }
              break;
      }
  }
  const run = (effect) => {
      if (effect.options.onTrigger) {
          effect.options.onTrigger({
              effect,
              target,
              key,
              type,
              newValue,
              oldValue,
              oldTarget
          });
      }
      if (effect.options.scheduler) {
          effect.options.scheduler(effect);
      }
      else {
          effect();
      }
  };
  effects.forEach(run);
}

const targetMap = new WeakMap();