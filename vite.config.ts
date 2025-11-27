import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress React 19 ref warning from MUI v5
        if (warning.message && warning.message.includes('element.ref')) return;
        warn(warning);
      }
    }
  }
})
