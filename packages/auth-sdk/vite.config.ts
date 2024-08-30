import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import * as packageJson from './package.json'
import dts from "vite-plugin-dts";
import replace from '@rollup/plugin-replace';


export default defineConfig({
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify("development"),
      preventAssignment: true
  }),
     dts({
    rollupTypes: true,
  })],
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
    
    include: [
      '.js',
      '.mjs',
    ],

  },

  resolve: {
    alias: {
      'process/browser': resolve('process/browser.js'),
      'path': 'path-browserify',
      "querystring": "querystring-es3",
      "stream": "stream-browserify",
    },
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  build: {
    lib: {
      entry: resolve('src', 'index.ts'),
      name: 'deposit-widget',
      formats: ['es'],
      fileName: (format) => `index.js`,
    },
    rollupOptions: {
      external: [...Object.keys(packageJson)],
    },

  },
  
})
