import { createResource } from "solid-js";
import { SolidMarkdown } from "solid-markdown";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Nav from '~/components/Nav';


export default function Home() {
  const [content] = createResource(async () => {
    const markdown = await import(`~/content/index.md`);
    return markdown.default;
  });

  return (
    <div>
      {Nav()}

      <main class="text-center mx-auto p-4" style="justify-content:center">
        <div>
          <h1 class="max-6-xs text-5xl font-thin" style={`color:#efb920;font-style:italic;text-shadow: 0 0 6px`}>
            piucenter
          </h1>
        </div>
      </main>

      <div class="markdown-content">
        {content() && (
          <SolidMarkdown 
            children={content()} 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          />
        )}
      </div>

    </div>
  );
}