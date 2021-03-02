export function emit(instance, event) {
  var rawArgs = [];
  for (var _i = 2; _i < arguments.length; _i++) {
      rawArgs[_i - 2] = arguments[_i];
  }
  var props = instance.props;
  var handlerName = toHandlerKey(camelize(event));
  var handler = props[handlerName];
  if (handler) {
      handler.apply(void 0, __spread(rawArgs));
  }
}

// 组件响应式原型
var publicPropertiesMap = {
  $emit: function (i) { return i.emit; },
};

export var PublicInstanceProxyHandlers = {
  get: function (_a, key) {
      var instance = _a._;
      var setupState = instance.setupState;
      console.log("\u89E6\u53D1 proxy hook , key -> : " + key);
      if (key !== "$") {
          if (key in setupState) {
              return setupState[key];
          }
      }
      var publicGetter = publicPropertiesMap[key];
      if (publicGetter) {
          return publicGetter(instance);
      }
  },
};