// [slug].tsx
import { createResource, onMount, createSignal, createEffect, Component } from "solid-js";
import { SolidMarkdown } from "solid-markdown";
import { useParams } from "@solidjs/router";
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import Nav from '~/components/Nav';
import frontMatter from 'front-matter';

import 'katex/dist/katex.min.css';


export default function MarkdownPage() {
  const params = useParams();
  const [currentParams, setCurrentParams] = createSignal(params.slug);
  const [isMounted, setIsMounted] = createSignal(false);
  const [markdownContent, setMarkdownContent] = createSignal('');

  onMount(() => {
    setIsMounted(true);
  });
  
  createEffect(() => {
    setCurrentParams(params.slug);
  });

  const [content] = createResource(currentParams, async (slug) => {
    const markdown = await import(`~/content/articles/${slug}.md`);
    // Parse front-matter from the markdown content
    const { attributes, body } = frontMatter(markdown.default);
    setMarkdownContent(body);
    return body;
  });

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
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeKatex]}
          />
        )}
      </div>
    </div>
  );
}