import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 8080,
    proxy: {
      '/proxy': {
        target: 'https://allorigins.hexlet.app',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/proxy/, ''),
      },
    },
  },
})
