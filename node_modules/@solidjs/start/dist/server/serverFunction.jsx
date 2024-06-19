import { getRequestEvent } from "solid-js/web";
/**
 *
 * Read more: https://docs.solidjs.com/solid-start/reference/server/get-server-function-meta
 */
export function getServerFunctionMeta() {
    return getRequestEvent()?.locals.serverFunctionMeta;
}
