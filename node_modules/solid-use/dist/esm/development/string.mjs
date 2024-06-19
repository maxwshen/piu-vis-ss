// src/string.ts
import { createMemo } from "solid-js";
function isAccessor(value) {
  return typeof value === "function";
}
function string(strings, ...args) {
  return createMemo(() => {
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
export {
  string as default
};
//# sourceMappingURL=string.mjs.map
