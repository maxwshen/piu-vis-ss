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

// src/online-status.ts
var online_status_exports = {};
__export(online_status_exports, {
  default: () => online_status_default
});
module.exports = __toCommonJS(online_status_exports);
var import_solid_js = require("solid-js");
var import_web = require("solid-js/web");
var useOnlineStatus = import_web.isServer ? () => () => true : () => {
  const [state, setState] = (0, import_solid_js.createSignal)(true);
  (0, import_solid_js.createEffect)(() => {
    const callback = () => {
      setState(navigator.onLine);
    };
    callback();
    window.addEventListener("online", callback, false);
    window.addEventListener("offline", callback, false);
    (0, import_solid_js.onCleanup)(() => {
      window.removeEventListener("online", callback, false);
      window.removeEventListener("offline", callback, false);
    });
  });
  return state;
};
var online_status_default = useOnlineStatus;
//# sourceMappingURL=online-status.cjs.map
