import tailwindcss from '@tailwindcss/vite'
import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

const config = defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  build: {
    sourcemap: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
  },
})

export default config
