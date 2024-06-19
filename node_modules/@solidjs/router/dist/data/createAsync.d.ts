/**
 * This is mock of the eventual Solid 2.0 primitive. It is not fully featured.
 */
import { type Accessor } from "solid-js";
import { type ReconcileOptions } from "solid-js/store";
export declare function createAsync<T>(fn: (prev: T) => Promise<T>, options: {
    name?: string;
    initialValue: T;
    deferStream?: boolean;
}): Accessor<T>;
export declare function createAsync<T>(fn: (prev: T | undefined) => Promise<T>, options?: {
    name?: string;
    initialValue?: T;
    deferStream?: boolean;
}): Accessor<T | undefined>;
export declare function createAsyncStore<T>(fn: (prev: T) => Promise<T>, options: {
    name?: string;
    initialValue: T;
    deferStream?: boolean;
    reconcile?: ReconcileOptions;
}): Accessor<T>;
export declare function createAsyncStore<T>(fn: (prev: T | undefined) => Promise<T>, options?: {
    name?: string;
    initialValue?: T;
    deferStream?: boolean;
    reconcile?: ReconcileOptions;
}): Accessor<T | undefined>;
