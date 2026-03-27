import { NextResponse } from "next/server";

export async function GET() {
  const manifest = {
    name: "Afra Tech Admin",
    short_name: "Afra Admin",
    description: "Admin panel for managing Afra Tech Point store.",
    id: "afra-tech-admin-pwa-v1",
    start_url: "/admin?mode=pwa",
    display: "standalone",
    background_color: "#111111",
    theme_color: "#000000",
    orientation: "portrait",
    scope: "/admin/",
    icons: [
      {
        src: "/icons/admin-icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/icons/admin-icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      }
    ],
    categories: ["business", "productivity"],
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
