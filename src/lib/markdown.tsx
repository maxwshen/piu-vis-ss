// This component lists all markdown articles
import frontMatter from 'front-matter';

interface ArticleAttributes {
  title?: string;
  description?: string;
  date?: string | Date;
}

export async function getMarkdownFiles() {
  const markdownFiles = import.meta.glob('../content/articles/*.md');
  
  const pages = await Promise.all(
    Object.entries(markdownFiles).map(async ([path, loader]) => {
      const content: any = await loader();
      const slug = path.split('/').pop()?.replace('.md', '');
      
      const { attributes, body } = frontMatter<ArticleAttributes>(content.default);
      
      return {
        slug,
        path,
        content: body,
        title: attributes.title || slug?.replace(/-/g, ' '),
        description: attributes.description || '',
        date: attributes.date ? new Date(attributes.date) : new Date(0), // Convert to Date object
      };
    })
  );

  // Sort pages by date in descending order (newest first)
  return pages.sort((a, b) => b.date.getTime() - a.date.getTime());
}