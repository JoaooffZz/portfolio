import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/portfolio/',
  assetsInclude: ['**/*.glb'],
  build: {
    outDir: 'docs',
    rollupOptions: {
      output: {
        // Keep the 3D stack out of the initial bundle. The hero scene is
        // lazy-mounted, so three/R3F must land in their own chunk or the
        // code-splitting buys us nothing.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (/[\\/]node_modules[\\/](three|@react-three)[\\/]/.test(id)) return 'three'
          if (/[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)) return 'react'
          if (/[\\/]node_modules[\\/](framer-motion|motion-dom|motion-utils|animejs)[\\/]/.test(id)) return 'motion'
        },
      },
    },
  },
})
