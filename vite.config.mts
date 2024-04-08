import path from "path";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/fpt-ts/",
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
});
