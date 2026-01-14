import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
// import legacy from "@vitejs/plugin-legacy";
import { viteSingleFile } from "vite-plugin-singlefile";

// https://vitejs.dev/config/
export default defineConfig({
  base: "/pytest-log-view/",
  plugins: [
    // legacy({
    //   targets: ["defaults", "not IE 11"],
    // }),
    vue(),
    // 单文件打包时使用
    // viteSingleFile({
    //   removeViteModuleLoader: true
    // })
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "/api/v1": {
        target: "http://10.41.40.60:8000",
        changeOrigin: true,
        // 不重写路径，直接转发 /api/v1/xxx -> http://10.41.40.60:8000/api/v1/xxx
      },
    },
  },
  // server: {
  //   host: "0.0.0.0",
  //   port: 5173,
  //   proxy: {
  //     "/kong/RdTestiTCExecutorService": {
  //       // target: "http://10.114.142.234/kong/RdTestiTCExecutorService",
  //       target: "http://rdtest.h3c.com/kong/RdTestiTCExecutorService",
  //       secure: false,
  //       changeOrigin: true,
  //       rewrite: (path) =>
  //         path.replace(/^\/kong\/RdTestiTCExecutorService/, ""),
  //     },
  //     "/kong/RdTestAiService-b": {
  //       // target: "http://10.114.142.234/kong/RdTestiTCExecutorService",
  //       target: "http://rdtest.h3c.com/kong/RdTestAiService-b",
  //       secure: false,
  //       changeOrigin: true,
  //       rewrite: (path) =>
  //         path.replace(/^\/kong\/RdTestAiService-b/, ""),
  //     },
  //   },
  // },
});
