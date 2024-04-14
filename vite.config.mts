import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";

export default defineConfig({
  base: "/fps/",
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      'src': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: "esnext",
  },
});
