import { SourceMapConsumer } from 'source-map-js';
export default function getSourceMap(url: string, content: string): Promise<SourceMapConsumer | null>;
