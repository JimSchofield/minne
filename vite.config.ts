import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  build: {
    emptyOutDir: true,
    lib: {
      entry: resolve(__dirname, 'lib/index.js'),
      name: "Minne",
      fileName: "index",
      formats: ['es'],
    },
    sourcemap: true,
    minify: true,
    terserOptions: {
      compress: true,
      mangle: true,
    },
  },
  plugins: [dts({ 
    tsconfigPath: "./tsconfig.json",
    include: "lib",
  })],
});
