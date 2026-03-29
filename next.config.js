/** @type {import('next').NextConfig} */

let nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // ── Compiler Optimizations ────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  // ── Aggressive HTTP Caching Headers ──────────────────────────────────
  async headers() {
    return [
      {
        // Static assets: 1 year immutable cache
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // Images: 30 days cache
        source: "/uploads/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=2592000, stale-while-revalidate=86400" },
        ],
      },
      {
        // Fonts & icons: 1 year
        source: "/fonts/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        // API routes: no caching (dynamic data)
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store, no-cache, must-revalidate" },
        ],
      },
    ];
  },

  // ── Image Optimization ────────────────────────────────────────────────
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
    formats: ["image/avif", "image/webp"],   // Serve AVIF first (40% smaller than WebP)
    minimumCacheTTL: 2592000,                // 30 day image cache (was 7 days)
    deviceSizes: [390, 768, 1280, 1440],     // Match real device breakpoints only
    imageSizes: [64, 128, 256, 384],         // Thumbnail sizes
    dangerouslyAllowSVG: false,
  },

  // ── Bundle Optimizations ──────────────────────────────────────────────
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "framer-motion",
      "@firebase/app",
      "@firebase/auth",
      "@firebase/firestore",
      "sonner",
    ],
  },

  // ── Dev Indicator Cleanup ─────────────────────────────────────────────
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
};

module.exports = nextConfig;
