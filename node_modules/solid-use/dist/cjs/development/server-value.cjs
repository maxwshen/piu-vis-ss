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

// src/server-value.ts
var server_value_exports = {};
__export(server_value_exports, {
  default: () => server_value_default
});
module.exports = __toCommonJS(server_value_exports);
var import_solid_js = require("solid-js");
var import_web = require("solid-js/web");
var useServerValue = import_web.isServer ? (cb) => {
  const ctx = import_solid_js.sharedConfig.context;
  const value = cb();
  if (ctx) {
    ctx.serialize(
      `${ctx.id}${ctx.count++}`,
      value,
      false
    );
  }
  return value;
} : (cb) => {
  const ctx = import_solid_js.sharedConfig.context;
  if (ctx && import_solid_js.sharedConfig.load && import_solid_js.sharedConfig.has) {
    const id = `${ctx.id}${ctx.count++}`;
    if (import_solid_js.sharedConfig.has(id)) {
      return import_solid_js.sharedConfig.load(id);
    }
  }
  return cb();
};
var server_value_default = useServerValue;
//# sourceMappingURL=server-value.cjs.map
