import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type Plugin } from 'vite'

const projectRoot = path.dirname(fileURLToPath(import.meta.url))

function fileProtocolAssetsPlugin(): Plugin {
  return {
    name: 'file-protocol-assets',
    transformIndexHtml: {
      order: 'post',
      handler: (html, context) => {
        if (context.server) {
          return html
        }

        return html
          .replace(/\s+crossorigin(?=[\s>])/gi, '')
          .replace(/\s+type=["']module["'](?=[\s>])/gi, ' defer')
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      output: {
        format: 'iife',
        name: 'NewTabApp',
      },
    },
  },
  plugins: [react(), tailwindcss(), fileProtocolAssetsPlugin()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, './src'),
    },
  },
})
