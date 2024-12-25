import { createResource, onMount } from "solid-js";
import { getMarkdownFiles } from "~/lib/markdown";


export default function Index() {
  const [pages] = createResource(getMarkdownFiles);

  onMount(() => {
    if (typeof window !== 'undefined') {
      window.document.title = 'Articles';
    }
  })

  return (
    <div class="min-h-screen bg-[#2e2e2e] text-gray-200">
      <main class="px-4 py-8 mx-auto" style={{ "max-width": "85ch" }}>
        <h1 class="text-3xl font-bold mb-8 text-gray-100">Articles</h1>
        
        <div class="grid gap-6">
          {pages()?.map(page => (
            <a
              href={`/articles/${page.slug}`}
              // target="_blank" rel="noopener noreferrer"
              class="p-6 rounded-lg border border-gray-700 hover:border-gray-600 
                     bg-gray-800/50 hover:bg-gray-800/80 transition-all duration-200"
            >
              <h2 class="text-xl font-medium text-gray-100">{page.title}</h2>
              {page.description && (
                <p class="text-gray-400 mt-3">{page.description}</p>
              )}
              {page.date && (
                <time class="block text-medium text-gray-500 mt-3">
                  {new Date(page.date).toLocaleDateString()}
                </time>
              )}
            </a>
          ))}
        </div>
      </main>
    </div>
  );
}