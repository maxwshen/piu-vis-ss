import { createResource, onMount, createSignal, createEffect } from "solid-js";
import { SolidMarkdown } from "solid-markdown";
import { useParams } from "@solidjs/router";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Nav from '~/components/Nav';


export default function MarkdownPage() {
  const params = useParams();
  const [currentParams, setCurrentParams] = createSignal(params.slug);
  const [isMounted, setIsMounted] = createSignal(false);

  // Mark when component is mounted on client
  onMount(() => {
    setIsMounted(true);
  });
  
  createEffect(() => {
    setCurrentParams(params.slug);
  });

  const [content] = createResource(currentParams, async (slug) => {
    const markdown = await import(`../content/${slug}.md`);
    return markdown.default;
  });

  // Only update title on client side after mount
  createEffect(() => {
    if (isMounted()) {
      const slug = currentParams();
      if (slug && typeof window !== 'undefined') {
        const title = slug
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        window.document.title = title;
      }
    }
  });

  return (
    <div>
      <Nav />
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