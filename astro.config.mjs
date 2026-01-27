import { defineConfig } from "astro/config";
import vercel from "@astrojs/vercel";
import react from "@astrojs/react";
import clerk from "@clerk/astro";
import { itIT } from "@clerk/localizations"; 
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  integrations: [clerk({localization:itIT,}), react()],
  output: "server",
  adapter: vercel(),
  vite: {
    plugins: [tailwindcss()],
    resolve: { alias: { "@": "/src" } },
  },
});
