// src/props.ts
import { createMemo } from "solid-js";
function omitProps(value, keys) {
  const newObject = {};
  const currentKeys = Object.keys(value);
  for (let i = 0, len = currentKeys.length; i < len; i += 1) {
    const key = currentKeys[i];
    if (!keys.includes(key)) {
      Object.defineProperty(newObject, key, {
        get() {
          return value[key];
        },
        configurable: true,
        enumerable: true
      });
    }
  }
  return newObject;
}
function pickProps(value, keys) {
  const newObject = {};
  const currentKeys = Object.keys(value);
  for (let i = 0, len = currentKeys.length; i < len; i += 1) {
    const key = currentKeys[i];
    if (keys.includes(key)) {
      Object.defineProperty(newObject, key, {
        get() {
          return value[key];
        },
        configurable: true,
        enumerable: true
      });
    }
  }
  return newObject;
}
function destructure(source) {
  const proxy = new Proxy(Array.isArray(source) ? [] : {}, {
    get(target, key) {
      const ref = Reflect.get(target, key);
      if (ref) {
        return ref;
      }
      const newRef = createMemo(() => source[key]);
      Reflect.set(target, key, newRef);
      return newRef;
    }
  });
  return proxy;
}
function spread(source) {
  const proxy = Array.isArray(source) ? [] : {};
  for (const key of Object.keys(source)) {
    const k = key;
    proxy[k] = createMemo(() => source[k]);
  }
  return proxy;
}
export {
  destructure,
  omitProps,
  pickProps,
  spread
};
//# sourceMappingURL=props.mjs.map
