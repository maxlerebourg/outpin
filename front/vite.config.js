import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { enhancedImages } from '@sveltejs/enhanced-img'
import { defineConfig } from 'vite'

const config = defineConfig({
  plugins: [enhancedImages(), tailwindcss(), sveltekit()],
  build: {
    sourcemap: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
  },
})

export default config
