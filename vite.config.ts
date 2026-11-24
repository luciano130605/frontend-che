import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    tanstackRouter(),
    react(),
    VitePWA({
      // Cuando hay una versión nueva, la app pregunta antes de recargar (ver PwaPrompt).
      registerType: "prompt",
      includeAssets: ["favicon.ico", "favicon-16x16.png", "favicon-32x32.png", "apple-touch-icon-180x180.png", "che-flat.svg"],
      manifest: {
        name: "Che — Organizá tu día",
        short_name: "Che",
        description: "Tu asistente personal para organizar tareas, recordatorios y prioridades.",
        lang: "es-AR",
        id: "/",
        start_url: "/app",
        scope: "/",
        display: "standalone",
        orientation: "portrait",
        background_color: "#EDF3EA",
        theme_color: "#FF8B66",
        categories: ["productivity"],
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
        shortcuts: [
          { name: "Mis tareas", url: "/app", icons: [{ src: "pwa-192x192.png", sizes: "192x192" }] },
          { name: "Mi perfil", url: "/profile", icons: [{ src: "pwa-192x192.png", sizes: "192x192" }] },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        // SPA: cualquier navegación sin red cae en index.html y la resuelve el router.
        navigateFallback: "/index.html",
        // La API nunca se cachea: son datos del usuario y tienen que estar frescos.
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: "StaleWhileRevalidate",
            options: { cacheName: "google-fonts-css" },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: "CacheFirst",
            options: {
              cacheName: "google-fonts-files",
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
});
