// [slug].tsx
// various plugins are used to support html and latex inside markdown
import { createResource, onMount, createSignal, createEffect, onCleanup, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { marked } from 'marked';
import frontMatter from 'front-matter';
import { Title } from "@solidjs/meta";

export default function MarkdownPage() {
  const [mdContent, setMDContent] = createSignal('');
  const [htmlContent, setHtmlContent] = createSignal('');
  const params = useParams();

  const [currentParams, setCurrentParams] = createSignal(params.slug);
  const [isMounted, setIsMounted] = createSignal(false);

  onMount(() => {
    setIsMounted(true);
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
  });

  createEffect(() => {
    setCurrentParams(params.slug);
  });

  const [content] = createResource(currentParams, async (slug) => {
    try {
      const markdown = await import(`~/content/articles/${slug}.md`);
      const { attributes, body } = frontMatter(markdown.default);
      return body;
    } catch (error) {
      console.error('Error loading markdown:', error);
      return '';
    }
  });

  // update document.title
  createEffect(() => {
    if (isMounted()) {

      // set 
      if (content()) {
        const parseContent = async () => {
          const parsedContent = await marked(content()!);
          setMDContent(parsedContent);
        }
        parseContent();
        setHtmlContent(mdContent());
      }
    }
  });

  return (
    <div>
      <Title>
        {currentParams().split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')}
      </Title>
      <div 
        class="markdown-content prose prose-invert max-w-none mx-auto px-4"
        innerHTML={htmlContent()} 
      />
    </div>
  );
}