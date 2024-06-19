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

// src/string.ts
var string_exports = {};
__export(string_exports, {
  default: () => string
});
module.exports = __toCommonJS(string_exports);
var import_solid_js = require("solid-js");
function isAccessor(value) {
  return typeof value === "function";
}
function string(strings, ...args) {
  return (0, import_solid_js.createMemo)(() => {
    let result = "";
    let a = 0;
    for (let i = 0, len = strings.length; i < len; i++) {
      result = `${result}${strings[i]}`;
      if (a < args.length) {
        const node = args[a++];
        if (isAccessor(node)) {
          result = `${result}${String(node())}`;
        } else {
          result = `${result}${String(node)}`;
        }
      }
    }
    return result;
  });
}
//# sourceMappingURL=string.cjs.map
