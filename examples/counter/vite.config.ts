import { defineConfig } from "vite";
import { canvactive } from "../../src/vite";

export default defineConfig({
  resolve: {
    alias: {
      "@canvactive/core": new URL("../../src/core/index.ts", import.meta.url).pathname,
      "@canvactive/elements": new URL("../../src/core/elements/index.ts", import.meta.url).pathname,
    },
  },
  plugins: [canvactive()],
});
