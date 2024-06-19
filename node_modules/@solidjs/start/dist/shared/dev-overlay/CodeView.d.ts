import { type JSX } from 'solid-js';
export interface CodeViewProps {
    fileName: string;
    content: string;
    line: number;
}
export declare function CodeView(props: CodeViewProps): JSX.Element | null;
