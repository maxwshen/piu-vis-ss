import { CacheEntry } from "../types.js";
export declare function revalidate(key?: string | string[] | void, force?: boolean): Promise<void>;
export declare function cacheKeyOp(key: string | string[] | void, fn: (cacheEntry: CacheEntry) => void): void;
export type CachedFunction<T extends (...args: any) => any> = T extends (...args: infer A) => infer R ? ([] extends {
    [K in keyof A]-?: A[K];
} ? (...args: never[]) => R : T) & {
    keyFor: (...args: A) => string;
    key: string;
} : never;
export declare function cache<T extends (...args: any) => any>(fn: T, name: string): CachedFunction<T>;
export declare namespace cache {
    var set: (key: string, value: any) => void;
    var clear: () => void;
}
export declare function hashKey<T extends Array<any>>(args: T): string;
