import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // proxy the API in dev so the auth cookie is first-party (same as the Vercel rewrite in prod)
    proxy: {
      "/api": process.env.API_PROXY_TARGET || "http://localhost:5000",
    },
  },
});
