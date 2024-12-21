// [slug].tsx
// various plugins are used to support html and latex inside markdown
import { createResource, onMount, createSignal, createEffect } from "solid-js";
import { SolidMarkdown } from "solid-markdown";
import { useParams } from "@solidjs/router";
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import type { Root } from 'hast';
import Nav from '~/components/Nav';
import frontMatter from 'front-matter';

import 'katex/dist/katex.min.css';

// Custom sanitization schema
const schema = {
  attributes: {
    '*': ['className', 'class'],
    div: ['className', 'class'],
    a: ['href', 'title', 'target'],
    img: ['src', 'alt', 'title']
  },
  tagNames: [
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'p', 'div', 'span',
    'strong', 'em', 'del', 'a', 'img',
    'blockquote', 'code', 'pre',
    'ol', 'ul', 'li',
    'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr'
  ]
};

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
    try {
      const markdown = await import(`~/content/articles/${slug}.md`);
      const { attributes, body } = frontMatter(markdown.default);
      setMarkdownContent(body);
      return body;
    } catch (error) {
      console.error('Error loading markdown:', error);
      return '';
    }
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
            remarkPlugins={[
              remarkGfm, 
              remarkMath
            ]}
            rehypePlugins={[
              rehypeRaw, 
              [rehypeSanitize, schema],
              rehypeKatex
            ]}
          />
        )}
      </div>
    </div>
  );
}