import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  esbuild: {
    jsxInject: 'import React from "react";',
    jsxFactory: 'React.createElement',
  },
  test: {
    globals: true, 
    environment: 'jsdom', 
    setupFiles: './src/test/setupTests.js',
  },
  plugins: [
    react(),
    tailwindcss()
  ],
})
