import { defineConfig } from "@solidjs/start/config";

export default defineConfig({
  ssr: false,
  server: {
    preset: "netlify",
  },
  vite: {
    // Add build optimizations
    build: {
      // Enable minification
      minify: 'terser',
      // Reduce chunk size warnings
      chunkSizeWarningLimit: 1000
    },
    // Enable caching for development
    plugins: [
      {
        name: 'markdown-loader',
        enforce: 'pre',
        transform(code, id) {
          if (!id.endsWith('.md')) return;
          
          const content = code
            .replace(/`/g, '\\`')
            .replace(/\${/g, '\\${');
          
          return {
            code: `export default \`${content}\`;`,
            map: null
          };
        }
      }
    ]
  }
});