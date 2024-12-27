import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";

export default defineConfig({
  plugins: [UnoCSS(), react()],
  build: {
    rollupOptions: {
      input: {
        popup: "src/popup/index.html",
        content: "src/content/index.ts",
        background: "src/background/index.ts",
      },
      output: {
        entryFileNames: "[name].js",
      },
    },
  },
});
