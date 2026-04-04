/** @type {import('next').NextConfig} */

let nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // ── Compiler Optimizations ────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },

  // ── Security + Caching Headers ────────────────────────────────────────
  async headers() {
    // Security headers applied to every page/route
    const securityHeaders = [
      // Prevent browsers from MIME-sniffing (stops content injection attacks)
      { key: "X-Content-Type-Options", value: "nosniff" },
      // Block site from being embedded in iframes (Clickjacking protection)
      { key: "X-Frame-Options", value: "SAMEORIGIN" },
      // Stop leaking referrer info to third-party sites
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      // Disable old dangerous browser features
      { key: "X-XSS-Protection", value: "1; mode=block" },
      // Force HTTPS for 2 years (HSTS) — only active in production
      { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      // Disable dangerous browser APIs (camera, mic, geolocation, etc.)
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
      // Allow popup interactions (fixes Firebase Google Sign-In on strict platforms)
      { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
      // Content Security Policy — prevents XSS attacks
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          // Firebase, fonts, images from trusted sources
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.gstatic.com https://apis.google.com",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com",
          "img-src 'self' data: blob: https://i.ibb.co https://images.unsplash.com https://firebasestorage.googleapis.com https://*.googleusercontent.com https://ik.imagekit.io",
          "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com wss://*.firebaseio.com",
          "frame-src https://accounts.google.com https://*.firebaseapp.com",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "upgrade-insecure-requests",
        ].join("; "),
      },
    ];

    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: securityHeaders,
      },
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
      { protocol: "https", hostname: "ik.imagekit.io" },
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
