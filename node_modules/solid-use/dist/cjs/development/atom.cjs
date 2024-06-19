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

// src/atom.ts
var atom_exports = {};
__export(atom_exports, {
  default: () => atom
});
module.exports = __toCommonJS(atom_exports);
var import_solid_js = require("solid-js");
function atom(value, equals = Object.is) {
  const [state, setState] = (0, import_solid_js.createSignal)(value, {
    equals
  });
  return (...args) => {
    if (args.length === 1) {
      setState(() => args[0]);
    }
    return state();
  };
}
//# sourceMappingURL=atom.cjs.map
