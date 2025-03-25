/** @type {import('@sveltejs/kit').Config} */
import adapter from '@sveltejs/adapter-static'

const config = {
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '/404.html',
      precompress: false,
      strict: true,
    }),
    paths: {
      relative: false,
    },
  },
}

export default config
