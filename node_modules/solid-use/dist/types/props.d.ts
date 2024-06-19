export declare function omitProps<T extends Record<string, any>, K extends keyof T>(value: T, keys: K[]): Omit<T, K>;
export declare function pickProps<T extends Record<string, any>, K extends keyof T>(value: T, keys: K[]): Pick<T, K>;
type ReactiveObject = Record<string | symbol, any> | any[];
export type Spread<T extends ReactiveObject> = {
    [key in keyof T]: Readonly<() => T[key]>;
};
export type KeyType<T extends ReactiveObject> = T extends any[] ? number : keyof T;
export declare function destructure<T extends ReactiveObject>(source: T): Spread<T>;
export declare function spread<T extends ReactiveObject>(source: T): Spread<T>;
export {};
//# sourceMappingURL=props.d.ts.map