export type RouterResponseInit = Omit<ResponseInit, "body"> & {
    revalidate?: string | string[];
};
export declare function redirect(url: string, init?: number | RouterResponseInit): never;
export declare function reload(init?: RouterResponseInit): never;
export declare function json<T>(data: T, init?: RouterResponseInit): T;
