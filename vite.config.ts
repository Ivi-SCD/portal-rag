import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import * as path from "path";

let moduleFederationSetup: any | null | undefined;

/* NÃO REMOVER! */
// @@MODULE_FEDERATION_REMOTE_SETUP@@

const plugins = [react()];

if (moduleFederationSetup !== null && moduleFederationSetup !== undefined) {
  plugins.push(moduleFederationSetup);
}

export default defineConfig(({ command }) => {
  return {
    base: command === "serve" ? "" : process.env.PORTAL_BASE_HREF,
    envDir: "./environment",
    plugins,
    build: {
      target: "esnext",
      outDir: "build",
      chunkSizeWarningLimit: 1500,
      modulePreload: false,
      minify: false,
      cssCodeSplit: false
    },
    resolve: {
      alias: [
        {
          find: "#",
          replacement: path.resolve(__dirname, "src")
        }
      ]
    },
    server: {
      port: 3000
    },
    preview: {
      port: 3001
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./.internals/setupTests.ts",
      testTimeout: 15000,
      coverage: {
        all: true,
        src: "./src",
        provider: "istanbul",
        reporter: [
          [
            "lcov",
            {
              projectRoot: "./src"
            }
          ],
          [
            "json",
            {
              file: "coverage.json"
            }
          ],
          ["html"]
        ],
        exclude: [
          "./build/**",
          "./public/**",
          "./docker/**",
          "./coverage/**",
          "./.internals/**",
          "./.husky/**",
          "./.stylelintrc.js",
          "./commitlint.config.js",
          "./version.ts",
          "**/__mocks__/**",
          "./src/utils/testUtils/**",
          "./src/main.tsx",
          "./src/App.tsx",
          "**.config.tsx",
          "./src/routes/**"
        ]
      },
      reportsDirectory: "./coverage",
      include: ["./src/**/**/*.{test,spec}.{ts,tsx}"]
    }
  };
});
