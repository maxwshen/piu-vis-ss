export interface Atom<T> {
    (): T;
    (value: T): T;
}
export default function atom<T>(value: T, equals?: (value1: any, value2: any) => boolean): Atom<T>;
//# sourceMappingURL=atom.d.ts.map