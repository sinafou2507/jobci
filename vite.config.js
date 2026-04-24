import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "icon-192.png", "icon-512.png"],
      manifest: {
        name: "JobCI - Emploi Côte d'Ivoire",
        short_name: "JobCI",
        description: "Toutes les offres d'emploi de Côte d'Ivoire",
        theme_color: "#0F2050",
        background_color: "#0F2050",
        display: "standalone",
        start_url: "/",
        scope: "/",
        orientation: "portrait",
        icons: [
          {
            src: "/icon-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any maskable",
          },
          {
            src: "/icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            // Listes d'offres — affiche le cache immédiatement, met à jour en arrière-plan
            urlPattern: ({ url }) =>
              url.hostname.includes("supabase") && url.pathname.includes("/rest/v1/jobs"),
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "jobs-cache",
              expiration: { maxEntries: 300, maxAgeSeconds: 86400 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Auth Supabase — toujours réseau
            urlPattern: ({ url }) =>
              url.hostname.includes("supabase") && url.pathname.includes("/auth/"),
            handler: "NetworkOnly",
          },
          {
            // Autres appels Supabase (favoris, etc.)
            urlPattern: ({ url }) => url.hostname.includes("supabase"),
            handler: "NetworkFirst",
            options: {
              cacheName: "supabase-misc",
              expiration: { maxEntries: 100, maxAgeSeconds: 3600 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Logos entreprises
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "images-cache",
              expiration: { maxEntries: 200, maxAgeSeconds: 604800 },
            },
          },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
  },
});
