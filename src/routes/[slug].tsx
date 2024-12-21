// [slug].tsx
import { createResource, onMount, onCleanup, createSignal, createEffect, Show } from "solid-js";
import { SolidMarkdown } from "solid-markdown";
import { useParams, useLocation, useNavigate } from "@solidjs/router";
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import Nav from '~/components/Nav';

export default function MarkdownPage() {
  console.log("MarkdownPage component initializing"); // Debug
  
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [currentPath, setCurrentPath] = createSignal(location.pathname);
  const [loadAttempts, setLoadAttempts] = createSignal(0);
  
  // Debug mount/unmount
  onMount(() => {
    console.log("MarkdownPage mounted, path:", location.pathname);
  });
  
  onCleanup(() => {
    console.log("MarkdownPage cleanup");
  });

  // Track path changes
  createEffect(() => {
    const path = location.pathname;
    console.log("Path changed to:", path);
    setCurrentPath(path);
    setLoadAttempts(prev => prev + 1);
  });

  const [content, { refetch }] = createResource(
    () => ({ path: currentPath(), attempt: loadAttempts() }), // Track both path and attempts
    async (source) => {
      try {
        console.log("Loading content for:", source.path);
        const pathWithoutSlash = source.path.slice(1);
        const markdown = await import(`../content/${pathWithoutSlash}.md`);
        console.log("Content loaded successfully");
        return markdown.default;
      } catch (error) {
        console.error("Failed to load markdown:", error);
        return null;
      }
    }
  );

  // Update title
  createEffect(() => {
    const path = currentPath();
    if (path && typeof window !== 'undefined') {
      const title = path
        .slice(1)
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      window.document.title = title;
      console.log("Title updated to:", title);
    }
  });

  return (
    <div>
      <Nav />
      <div class="markdown-content">
        <Show
          when={content()}
          fallback={<div>Loading content for {currentPath()}...</div>}
        >
          <SolidMarkdown 
            children={content()} 
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw]}
          />
        </Show>
      </div>
    </div>
  );
}