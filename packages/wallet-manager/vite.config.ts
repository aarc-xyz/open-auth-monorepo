import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react-swc'
import * as packageJson from './package.json'
import dts from "vite-plugin-dts";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import replace from '@rollup/plugin-replace';
import babel from 'rollup-plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    replace({
      "process.env.NODE_ENV": JSON.stringify("development")
  }),
  commonjs({
    include: /node_modules/,
    requireReturnsDefault: 'auto',
}),
  babel({
    babelrc: true,
    exclude: 'node_modules/**'
}),
    react(),  dts({
    rollupTypes: true,
  })],
  optimizeDeps: {
    disabled: false,
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
            buffer: false
        }),
    ]
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
      external: [...Object.keys(packageJson.dependencies)],
    },
    commonjsOptions: {
      ignore: ['@reduxjs/toolkit'], // Ignore the problematic module
      include : []
    },
  },
  
})
