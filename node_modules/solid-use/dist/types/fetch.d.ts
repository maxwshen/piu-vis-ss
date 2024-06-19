import type { Resource } from 'solid-js';
type Signalify<T> = T | (() => T);
export declare class SuspensefulFetchResponse {
    private input;
    private init?;
    constructor(input: Signalify<RequestInfo | URL>, init?: Signalify<RequestInit | undefined>);
    private readResponse;
    arrayBuffer(): Resource<ArrayBuffer | undefined>;
    blob(): Resource<Blob | undefined>;
    formData(): Resource<FormData | undefined>;
    json<T>(): Resource<T>;
    text(): Resource<string | undefined>;
}
export interface FetchPending<T> {
    status: 'pending';
    value?: Promise<T>;
}
export interface FetchSuccess<T> {
    status: 'success';
    value: T;
}
export interface FetchFailure {
    status: 'failure';
    value: any;
}
export type FetchResult<T> = FetchPending<T> | FetchSuccess<T> | FetchFailure;
export declare class SuspenselessFetchResponse {
    private input;
    private init?;
    constructor(input: Signalify<RequestInfo | URL>, init?: Signalify<RequestInit | undefined>);
    private readResponse;
    arrayBuffer(): FetchResult<ArrayBuffer>;
    blob(): FetchResult<Blob>;
    formData(): FetchResult<FormData>;
    json<T>(): FetchResult<T>;
    text(): FetchResult<string>;
}
declare function fetch(input: Signalify<RequestInfo | URL>, init?: Signalify<RequestInit | undefined>, suspense?: false): SuspenselessFetchResponse;
declare function fetch(input: Signalify<RequestInfo | URL>, init?: Signalify<RequestInit | undefined>, suspense?: true): SuspensefulFetchResponse;
export default fetch;
//# sourceMappingURL=fetch.d.ts.map