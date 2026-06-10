import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react(), glsl({ compress: true })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        // Rolldown-native chunking. The old `manualChunks` function landed
        // three.js core in the eager catch-all `vendor` chunk. Group order is
        // priority — groups also absorb their matches' dependencies, so the
        // eager packages (react, app libs) must be captured BEFORE the
        // desktop-only three group, or three drags react into its chunk and
        // becomes eager itself. Tests match the package path segment exactly
        // so e.g. react-router-dom doesn't get caught by the react group.
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: /node_modules[\\/](react|react-dom|scheduler|use-sync-external-store)[\\/]/ },
            { name: 'vendor-gsap',  test: /node_modules[\\/]gsap[\\/]/ },
            { name: 'vendor',       test: /node_modules[\\/](zustand|lenis|react-router|react-router-dom|@vercel|lucide-react)[\\/]/ },
            { name: 'vendor-three', test: /node_modules[\\/](three|three-stdlib|@react-three)[\\/]/ },
            { name: 'vendor-misc',  test: /node_modules[\\/]/ },
          ],
        },
      },
    },
  },
})
