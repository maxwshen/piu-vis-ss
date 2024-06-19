"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/props.ts
var props_exports = {};
__export(props_exports, {
  destructure: () => destructure,
  omitProps: () => omitProps,
  pickProps: () => pickProps,
  spread: () => spread
});
module.exports = __toCommonJS(props_exports);
var import_solid_js = require("solid-js");
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
      const newRef = (0, import_solid_js.createMemo)(() => source[key]);
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
    proxy[k] = (0, import_solid_js.createMemo)(() => source[k]);
  }
  return proxy;
}
//# sourceMappingURL=props.cjs.map
