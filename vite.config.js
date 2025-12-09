import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Fix for vfile and other packages using Node.js subpath imports
      '#minpath': path.resolve(__dirname, 'node_modules/vfile/lib/minpath.browser.js'),
      '#minproc': path.resolve(__dirname, 'node_modules/vfile/lib/minproc.browser.js'),
      '#minurl': path.resolve(__dirname, 'node_modules/vfile/lib/minurl.browser.js'),
    }
  },
  build: {
    // Suppress "use client" directive warnings
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignore "use client" directive warnings
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') {
          return;
        }
        warn(warning);
      }
    },
    // Increase chunk size limit to avoid warnings
    chunkSizeWarningLimit: 1000,
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})
