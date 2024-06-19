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

// src/provider.ts
var provider_exports = {};
__export(provider_exports, {
  capturedProvider: () => capturedProvider,
  createProvider: () => createProvider,
  inject: () => inject,
  provide: () => provide,
  providerScope: () => providerScope,
  withProvider: () => withProvider
});
module.exports = __toCommonJS(provider_exports);
var import_solid_js = require("solid-js");
var PROVIDER;
function capturedProvider(callback) {
  const current = PROVIDER;
  return (...args) => {
    const parent = PROVIDER;
    PROVIDER = current;
    try {
      return callback(...args);
    } finally {
      PROVIDER = parent;
    }
  };
}
function providerScope(callback) {
  const parent = PROVIDER;
  PROVIDER = {
    parent,
    data: {}
  };
  try {
    return callback();
  } finally {
    PROVIDER = parent;
  }
}
var ID = 0;
function createProvider(defaultValue) {
  return {
    id: ID++,
    defaultValue
  };
}
function provide(context, value) {
  const parent = PROVIDER;
  if (parent) {
    parent.data[context.id] = { value };
    (0, import_solid_js.onCleanup)(() => {
      parent.data[context.id] = void 0;
    });
  }
}
function inject(context) {
  let current = PROVIDER;
  while (current) {
    const currentData = current.data[context.id];
    if (currentData) {
      return currentData.value;
    }
    current = current.parent;
  }
  return context.defaultValue;
}
function withProvider(Comp) {
  return (props) => providerScope(() => Comp(props));
}
//# sourceMappingURL=provider.cjs.map
