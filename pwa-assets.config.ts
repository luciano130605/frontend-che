import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

// Genera los íconos de la PWA a partir del logo: `npm run generate-pwa-assets`
export default defineConfig({
  headLinkOptions: { preset: "2023" },
  preset: {
    ...minimal2023Preset,
    // el SVG ya trae margen (el logo ocupa ~74%), entra en la zona segura del maskable sin padding extra
    maskable: { ...minimal2023Preset.maskable, padding: 0, resizeOptions: { background: "#EDF3EA" } },
    apple: { ...minimal2023Preset.apple, padding: 0.05, resizeOptions: { background: "#EDF3EA" } },
  },
  images: ["public/che-flat.svg"],
});
