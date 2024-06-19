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

// src/page-visibility.ts
var page_visibility_exports = {};
__export(page_visibility_exports, {
  default: () => page_visibility_default
});
module.exports = __toCommonJS(page_visibility_exports);
var import_solid_js = require("solid-js");
var import_web = require("solid-js/web");
var usePageVisibility = import_web.isServer ? () => () => true : () => {
  const [state, setState] = (0, import_solid_js.createSignal)(true);
  (0, import_solid_js.createEffect)(() => {
    const callback = () => {
      setState(document.visibilityState === "visible");
    };
    callback();
    document.addEventListener("visibilitychange", callback, false);
    (0, import_solid_js.onCleanup)(() => {
      document.removeEventListener("visibilitychange", callback, false);
    });
  });
  return state;
};
var page_visibility_default = usePageVisibility;
//# sourceMappingURL=page-visibility.cjs.map
