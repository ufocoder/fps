import { defineConfig } from "vite";

export default defineConfig({
  base: "/fpt/",
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
});
