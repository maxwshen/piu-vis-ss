// src/media-query.ts
import { createEffect, createSignal, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
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
var useMediaQuery = isServer ? (_query) => () => false : (query) => {
  const media = getMediaMatcher(query);
  const [state, setState] = createSignal(false);
  createEffect(() => {
    const callback = () => {
      setState(media.matches);
    };
    callback();
    media.addEventListener("change", callback, false);
    onCleanup(() => {
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
export {
  useMediaQuery,
  usePrefersDark,
  usePrefersLight,
  usePrefersReducedMotion
};
//# sourceMappingURL=media-query.mjs.map
