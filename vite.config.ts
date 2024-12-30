import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
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

// 生成入口文件
async function generateEntryFiles() {
  // 確保目錄存在
  await fs.ensureDir("src/background");
  await fs.ensureDir("src/content");

  // 檢查並創建入口文件
  if (!fs.existsSync("src/background/index.ts")) {
    await fs.writeFile(
      "src/background/index.ts",
      `
// 監聽來自 content script 的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_GITHUB_TOKEN') {
    chrome.storage.sync.get(['github_token'], (result) => {
      sendResponse({ token: result.github_token });
    });
    return true;
  }
});
    `
    );
  }

  if (!fs.existsSync("src/content/index.ts")) {
    await fs.writeFile(
      "src/content/index.ts",
      `
// 檢查是否在 GitHub 頁面
if (window.location.hostname === 'github.com') {
  console.log('GitHub Profile AI Generator 已啟動');
}
    `
    );
  }
}

export default defineConfig(async () => {
  await generateEntryFiles();

  return {
    plugins: [react(), copyManifestAndAssets()],
    resolve: {
      alias: {
        "@": resolve(__dirname, "./src"),
      },
    },
    css: {
      postcss: "./postcss.config.js",
    },
    build: {
      outDir: "dist",
      emptyOutDir: true,
      rollupOptions: {
        input: {
          popup: resolve(__dirname, "src/popup/index.html"),
          oauth: resolve(__dirname, "src/oauth/index.html"),
          background: resolve(__dirname, "src/background/index.ts"),
          content: resolve(__dirname, "src/content/index.ts"),
        },
        output: {
          entryFileNames: "assets/[name].js",
          chunkFileNames: "assets/[name].[hash].js",
          assetFileNames: "assets/[name].[ext]",
        },
      },
    },
  };
});
