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

// src/media-query.ts
var media_query_exports = {};
__export(media_query_exports, {
  useMediaQuery: () => useMediaQuery,
  usePrefersDark: () => usePrefersDark,
  usePrefersLight: () => usePrefersLight,
  usePrefersReducedMotion: () => usePrefersReducedMotion
});
module.exports = __toCommonJS(media_query_exports);
var import_solid_js = require("solid-js");
var import_web = require("solid-js/web");
var MEDIA = /* @__PURE__ */ new Map();
function getMediaMatcher(query) {
  const media = MEDIA.get(query);
  if (media) {
    return media;
  }
  const newMedia = window.matchMedia(query);
  MEDIA.set(query, newMedia);
  return newMedia;
}
var useMediaQuery = import_web.isServer ? (_query) => () => false : (query) => {
  const media = getMediaMatcher(query);
  const [state, setState] = (0, import_solid_js.createSignal)(false);
  (0, import_solid_js.createEffect)(() => {
    const callback = () => {
      setState(media.matches);
    };
    callback();
    media.addEventListener("change", callback, false);
    (0, import_solid_js.onCleanup)(() => {
      media.removeEventListener("change", callback, false);
    });
  });
  return state;
};
function usePrefersDark() {
  return useMediaQuery("(prefers-color-scheme: dark)");
}
function usePrefersLight() {
  return useMediaQuery("(prefers-color-scheme: light)");
}
function usePrefersReducedMotion() {
  return useMediaQuery("(prefers-reduced-motion)");
}
//# sourceMappingURL=media-query.cjs.map
