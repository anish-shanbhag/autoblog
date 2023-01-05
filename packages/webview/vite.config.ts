import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

export default defineConfig({
  root: "src",
  plugins: [react()],
  server: {
    strictPort: true,
  },
  esbuild: {
    exclude: "react-dom",
  },
  build: {
    outDir: "../dist",
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
  resolve: {
    alias: {
      path: "path-browserify",
    },
  },
});
