// src/atom.ts
import { createSignal } from "solid-js";
function atom(value, equals = Object.is) {
  const [state, setState] = createSignal(value, {
    equals
  });
  return (...args) => {
    if (args.length === 1) {
      setState(() => args[0]);
    }
    return state();
  };
}
export {
  atom as default
};
//# sourceMappingURL=atom.mjs.map
