import { defineConfig } from "astro/config";
import node from "@astrojs/node";
import react from "@astrojs/react";
import clerk from "@clerk/astro";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [clerk(), react()],
  output: "server",
  adapter: node({ mode: "standalone" }),
  vite: {
    plugins: [tailwindcss()],
    resolve: { alias: { "@": "/src" } }
  },
});
