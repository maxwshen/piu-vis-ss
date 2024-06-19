import type { JSX } from "solid-js";
import { type MountableElement } from "solid-js/web";
/**
 *
 * Read more: https://docs.solidjs.com/solid-start/reference/client/mount
 */
export declare function mount(fn: () => JSX.Element, el: MountableElement): (() => void) | undefined;
