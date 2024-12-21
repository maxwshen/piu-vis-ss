// [slug].tsx
// various plugins are used to support html and latex inside markdown
import { createResource, onMount, createSignal, createEffect, onCleanup, Show } from "solid-js";
import { SolidMarkdown } from "solid-markdown";
import { useParams, useNavigate } from "@solidjs/router";
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeRaw from 'rehype-raw';
import rehypeKatex from 'rehype-katex';
import rehypeSanitize from 'rehype-sanitize';
import type { Root } from 'hast';
import Nav from '~/components/Nav';
import frontMatter from 'front-matter';
import { Title } from "@solidjs/meta";

import 'katex/dist/katex.min.css';

// Custom sanitization schema
const schema = {
  attributes: {
    '*': ['className', 'class', 'style'],
    div: ['className', 'class', 'style'],
    span: ['className', 'class', 'style'],
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
  const navigate = useNavigate();

  const [currentParams, setCurrentParams] = createSignal(params.slug);
  const [isMounted, setIsMounted] = createSignal(false);
  const [markdownContent, setMarkdownContent] = createSignal('');

  onMount(() => {
    setIsMounted(true);
    // Add click event listener to handle internal navigation
    document.addEventListener('click', handleLinkClick);
  });

  // Cleanup listener on component unmount
  onCleanup(() => {
    if (typeof window !== 'undefined') {
      document.removeEventListener('click', handleLinkClick);
    }
  });
  
  const handleLinkClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    
    if (!link) return; // Not a link click
    
    const href = link.getAttribute('href');
    if (!href) return; // No href attribute
    
    // Check if this is an internal link
    if (href.startsWith('/') && !href.startsWith('//')) {
      e.preventDefault(); // Prevent default navigation
      
      // Navigate using SolidJS router
      navigate(href);
    }
  };

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

  // update document.title
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
      <Title>{currentParams().split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}</Title>
      <Nav />
      <div class="markdown-content">
        <Show when={params.slug} keyed>
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
        </Show>
      </div>
    </div>
  );
}