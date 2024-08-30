import tailwindcss from 'tailwindcss';
import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react-swc'
import * as packageJson from './package.json'
import dts from "vite-plugin-dts";
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import {babel} from '@rollup/plugin-babel';
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'

export default defineConfig({
  plugins: [

    react(),  dts({
    rollupTypes: true,
  })],
  optimizeDeps: {
 
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
      }),
      NodeModulesPolyfillPlugin()
    ]
    },
    
    include: [
      '.js',
      '.mjs',
    ],

  },

  resolve: {
    alias: {
       stream: 'stream-browserify',
    }
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
      plugins: [
        // @ts-ignore
        rollupNodePolyFill(),
    ]
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  
})
