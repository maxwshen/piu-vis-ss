import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  server: {
    preset: "netlify"
  },
  vite: {
    plugins: [
      {
        name: 'markdown-loader',
        enforce: 'pre',
        transform(code, id) {
          if (!id.endsWith('.md')) return;
          
          // Properly handle the markdown content
          const content = code
            .replace(/`/g, '\\`')  // Escape backticks
            .replace(/\${/g, '\\${');  // Escape template literals
          
          return {
            code: `export default \`${content}\`;`,
            map: null
          };
        }
      }
    ]
  }
});