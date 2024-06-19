// src/page-visibility.ts
import { createEffect, createSignal, onCleanup } from "solid-js";
import { isServer } from "solid-js/web";
var usePageVisibility = isServer ? () => () => true : () => {
  const [state, setState] = createSignal(true);
  createEffect(() => {
    const callback = () => {
      setState(document.visibilityState === "visible");
    };
    callback();
    document.addEventListener("visibilitychange", callback, false);
    onCleanup(() => {
      document.removeEventListener("visibilitychange", callback, false);
    });
  });
  return state;
};
var page_visibility_default = usePageVisibility;
export {
  page_visibility_default as default
};
//# sourceMappingURL=page-visibility.mjs.map
