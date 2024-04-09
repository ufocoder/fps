import { defineConfig } from "vite";

export default defineConfig({
  base: "/fps/",
  server: {
    port: 3000,
  },
  build: {
    target: "esnext",
  },
});
