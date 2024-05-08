/// <reference types="vitest" />
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    setupFiles: ["dotenv/config"],
    alias: {
      "@/": new URL("./src/", import.meta.url).pathname,
      "~/": new URL("./src/", import.meta.url).pathname,
    },
  },
});
