import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative asset paths, so the build works on GitHub Pages under /<repo>/ (and anywhere else).
  base: './',
  // Emit every asset (e.g. the 270 flag SVGs) as its own file instead of inlining it.
  build: { assetsInlineLimit: 0 },
})
