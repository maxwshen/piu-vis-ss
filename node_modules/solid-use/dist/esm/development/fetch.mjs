// src/fetch.ts
import { createEffect, createResource, createSignal } from "solid-js";
var nativeFetch = globalThis.fetch;
function isSignal(value) {
  return typeof value === "function";
}
function fromSignal(value) {
  if (isSignal(value)) {
    return value();
  }
  return value;
}
var SuspensefulFetchResponse = class {
  constructor(input, init) {
    this.input = input;
    this.init = init;
  }
  readResponse() {
    return [fromSignal(this.input), fromSignal(this.init)];
  }
  arrayBuffer() {
    return createResource(
      () => this.readResponse(),
      async ([localInput, localInit]) => {
        const response = await nativeFetch(localInput, localInit);
        return response.arrayBuffer();
      }
    )[0];
  }
  blob() {
    return createResource(
      () => this.readResponse(),
      async ([localInput, localInit]) => {
        const response = await nativeFetch(localInput, localInit);
        return response.blob();
      }
    )[0];
  }
  formData() {
    return createResource(
      () => this.readResponse(),
      async ([localInput, localInit]) => {
        const response = await nativeFetch(localInput, localInit);
        return response.formData();
      }
    )[0];
  }
  json() {
    return createResource(
      () => this.readResponse(),
      async ([localInput, localInit]) => {
        const response = await nativeFetch(localInput, localInit);
        return response.json();
      }
    )[0];
  }
  text() {
    return createResource(
      () => this.readResponse(),
      async ([localInput, localInit]) => {
        const response = await nativeFetch(localInput, localInit);
        return response.text();
      }
    )[0];
  }
};
var InternalFetchResult = class {
  constructor(source) {
    this.source = source;
  }
  get value() {
    return this.source().value;
  }
  get status() {
    return this.source().status;
  }
};
function useAsync(source) {
  const [value, setValue] = createSignal({
    status: "pending"
  });
  createEffect(() => {
    const result = source();
    setValue({
      status: "pending",
      value: result
    });
    result.then(
      (val) => {
        setValue({
          status: "success",
          value: val
        });
      },
      (val) => {
        setValue({
          status: "failure",
          value: val
        });
      }
    );
  });
  return new InternalFetchResult(value);
}
var SuspenselessFetchResponse = class {
  constructor(input, init) {
    this.input = input;
    this.init = init;
  }
  async readResponse() {
    return await nativeFetch(fromSignal(this.input), fromSignal(this.init));
  }
  arrayBuffer() {
    return useAsync(async () => {
      const response = await this.readResponse();
      return response.arrayBuffer();
    });
  }
  blob() {
    return useAsync(async () => {
      const response = await this.readResponse();
      return response.blob();
    });
  }
  formData() {
    return useAsync(async () => {
      const response = await this.readResponse();
      return response.formData();
    });
  }
  json() {
    return useAsync(async () => {
      const response = await this.readResponse();
      return response.json();
    });
  }
  text() {
    return useAsync(async () => {
      const response = await this.readResponse();
      return response.text();
    });
  }
};
function fetch(input, init, suspense) {
  if (suspense) {
    return new SuspensefulFetchResponse(input, init);
  }
  return new SuspenselessFetchResponse(input, init);
}
var fetch_default = fetch;
export {
  SuspensefulFetchResponse,
  SuspenselessFetchResponse,
  fetch_default as default
};
//# sourceMappingURL=fetch.mjs.map
