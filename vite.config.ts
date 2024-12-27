import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import UnoCSS from "unocss/vite";
import { resolve } from "path";
import fs from "fs-extra";

// 複製 manifest.json 和 assets 到 dist
function copyManifestAndAssets() {
  return {
    name: "copy-manifest-and-assets",
    closeBundle: async () => {
      // 複製 manifest.json
      await fs.copy("manifest.json", "dist/manifest.json");

      // 檢查 assets 目錄是否存在，如果存在才複製
      if (fs.existsSync("assets")) {
        await fs.copy("assets", "dist/assets");
      }
    },
  };
}

export default defineConfig({
  plugins: [UnoCSS(), react(), copyManifestAndAssets()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "src/popup/index.html"),
        content: resolve(__dirname, "src/content/index.ts"),
        background: resolve(__dirname, "src/background/index.ts"),
      },
      output: {
        entryFileNames: "assets/[name].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
