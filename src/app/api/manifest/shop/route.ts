import { NextResponse } from "next/server";

export async function GET() {
  const manifest = {
    name: "Afra Tech Store",
    short_name: "Afra Store",
    description: "Your premium destination for the latest electronics and smart home devices.",
    id: "afra-tech-store-pwa-v1",
    start_url: "/?mode=pwa",
    display: "standalone",
    background_color: "#f9fafb",
    theme_color: "#111111",
    orientation: "portrait",
    scope: "/",
    icons: [
      {
        src: "/icons/shop-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/icons/shop-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      }
    ],
    categories: ["shopping", "lifestyle"],
    lang: "en",
    dir: "ltr"
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      "Cache-Control": "public, s-maxage=1, stale-while-revalidate=59"
    }
  });
}
