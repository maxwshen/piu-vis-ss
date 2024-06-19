// src/server-value.ts
import { sharedConfig } from "solid-js";
import { isServer } from "solid-js/web";
var useServerValue = isServer ? (cb) => {
  const ctx = sharedConfig.context;
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
  const ctx = sharedConfig.context;
  if (ctx && sharedConfig.load && sharedConfig.has) {
    const id = `${ctx.id}${ctx.count++}`;
    if (sharedConfig.has(id)) {
      return sharedConfig.load(id);
    }
  }
  return cb();
};
var server_value_default = useServerValue;
export {
  server_value_default as default
};
//# sourceMappingURL=server-value.mjs.map
