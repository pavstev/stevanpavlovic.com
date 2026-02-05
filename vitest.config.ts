/// <reference types="vitest" />
import { getViteConfig } from "astro/config";
import path from "path";

export default getViteConfig({
  resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@client": path.resolve(__dirname, "./src/client"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@constants": path.resolve(__dirname, "./src/constants.ts"),
      "@server": path.resolve(__dirname, "./src/server"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["./src/test/setup.ts"],
  },
});
