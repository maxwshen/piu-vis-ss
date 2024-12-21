import { defineConfig } from "@solidjs/start/config";
// import { VitePluginConfig } from "vite";


export default defineConfig({
  server: {
    preset: "netlify"
  },
  vite: {
    plugins: [
      {
        name: 'markdown-loader',
        transform(code, id) {
          if (!id.endsWith('.md')) return;
          return `export default ${JSON.stringify(code)}`;
        }
      }
    ]
  }
});