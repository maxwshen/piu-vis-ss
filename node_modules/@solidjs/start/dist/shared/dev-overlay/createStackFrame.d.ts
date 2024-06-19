import { type Accessor } from "solid-js";
export interface StackFrameSource {
    content: string;
    source: string;
    name?: string;
    line: number;
    column: number;
}
export declare function createStackFrame(stackframe: StackFrame, isCompiled: () => boolean): Accessor<StackFrameSource>;
