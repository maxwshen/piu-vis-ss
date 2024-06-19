// src/provider.ts
import { onCleanup } from "solid-js";
var PROVIDER;
function capturedProvider(callback) {
  const current = PROVIDER;
  return (...args) => {
    const parent = PROVIDER;
    PROVIDER = current;
    try {
      return callback(...args);
    } finally {
      PROVIDER = parent;
    }
  };
}
function providerScope(callback) {
  const parent = PROVIDER;
  PROVIDER = {
    parent,
    data: {}
  };
  try {
    return callback();
  } finally {
    PROVIDER = parent;
  }
}
var ID = 0;
function createProvider(defaultValue) {
  return {
    id: ID++,
    defaultValue
  };
}
function provide(context, value) {
  const parent = PROVIDER;
  if (parent) {
    parent.data[context.id] = { value };
    onCleanup(() => {
      parent.data[context.id] = void 0;
    });
  }
}
function inject(context) {
  let current = PROVIDER;
  while (current) {
    const currentData = current.data[context.id];
    if (currentData) {
      return currentData.value;
    }
    current = current.parent;
  }
  return context.defaultValue;
}
function withProvider(Comp) {
  return (props) => providerScope(() => Comp(props));
}
export {
  capturedProvider,
  createProvider,
  inject,
  provide,
  providerScope,
  withProvider
};
//# sourceMappingURL=provider.mjs.map
