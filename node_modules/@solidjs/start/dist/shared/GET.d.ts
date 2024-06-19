/**
 *
 * Read more: https://docs.solidjs.com/solid-start/reference/server/get
 */
export declare function GET<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => ReturnType<T>;
