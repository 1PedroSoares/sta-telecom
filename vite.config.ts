import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),

       'react/jsx-runtime': path.resolve('./node_modules/react/jsx-runtime.js'),
      'react/jsx-dev-runtime': path.resolve('./node_modules/react/jsx-dev-runtime.js'),
    },
  },
      optimizeDeps: {
    include: ['react', 'react-dom'],
  },
}));