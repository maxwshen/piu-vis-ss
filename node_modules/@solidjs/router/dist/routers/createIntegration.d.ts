import type { LocationChange, RouterContext, RouterUtils } from "../types";
export declare function createIntegration(get: () => string | LocationChange, set: (next: LocationChange) => void, init?: (notify: (value?: string | LocationChange) => void) => () => void, create?: (router: RouterContext) => void, utils?: Partial<RouterUtils>): (props: import("./components").RouterProps) => import("solid-js").JSX.Element;
export declare function bindEvent(target: EventTarget, type: string, handler: EventListener): () => void;
export declare function scrollToHash(hash: string, fallbackTop?: boolean): void;
