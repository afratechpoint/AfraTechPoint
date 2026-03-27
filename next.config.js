/** @type {import('next').NextConfig} */

// next-pwa is only applied in production builds (not dev with Turbopack)
// In development, Turbopack is used which doesn't support webpack plugins.
// The service worker is only registered in production builds anyway.

const isDev = process.env.NODE_ENV === "development";

let nextConfig = {
  devIndicators: {
    appIsrStatus: false,
    buildActivity: false,
  },
  // Empty turbopack config silences the Turbopack/webpack conflict warning
  turbopack: {},
};

if (!isDev) {
  const withPWA = require("next-pwa")({
    dest: "public",
    register: false,
    skipWaiting: true,
    disable: false,
    fallbacks: {
      document: "/offline.html",
    },
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "firebase-storage-cache",
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      {
        urlPattern: /\/_next\/static\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static-cache",
          expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
        },
      },
      {
        urlPattern: /\/_next\/image\?.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-image-cache",
          expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
        },
      },
    ],
  });
  nextConfig = withPWA(nextConfig);
}

module.exports = nextConfig;
