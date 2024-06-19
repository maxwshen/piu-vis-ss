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

// src/fetch.ts
var fetch_exports = {};
__export(fetch_exports, {
  SuspensefulFetchResponse: () => SuspensefulFetchResponse,
  SuspenselessFetchResponse: () => SuspenselessFetchResponse,
  default: () => fetch_default
});
module.exports = __toCommonJS(fetch_exports);
var import_solid_js = require("solid-js");
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
    return (0, import_solid_js.createResource)(
      () => this.readResponse(),
      async ([localInput, localInit]) => {
        const response = await nativeFetch(localInput, localInit);
        return response.arrayBuffer();
      }
    )[0];
  }
  blob() {
    return (0, import_solid_js.createResource)(
      () => this.readResponse(),
      async ([localInput, localInit]) => {
        const response = await nativeFetch(localInput, localInit);
        return response.blob();
      }
    )[0];
  }
  formData() {
    return (0, import_solid_js.createResource)(
      () => this.readResponse(),
      async ([localInput, localInit]) => {
        const response = await nativeFetch(localInput, localInit);
        return response.formData();
      }
    )[0];
  }
  json() {
    return (0, import_solid_js.createResource)(
      () => this.readResponse(),
      async ([localInput, localInit]) => {
        const response = await nativeFetch(localInput, localInit);
        return response.json();
      }
    )[0];
  }
  text() {
    return (0, import_solid_js.createResource)(
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
  const [value, setValue] = (0, import_solid_js.createSignal)({
    status: "pending"
  });
  (0, import_solid_js.createEffect)(() => {
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
//# sourceMappingURL=fetch.cjs.map
