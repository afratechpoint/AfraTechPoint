// Server Component — no "use client" directive.
// This allows Next.js to SSR the page shell and bake the
// hero image URL into the initial HTML, so the browser can
// start fetching it immediately (before JS runs) → lower LCP.

import React from "react";
import { storage } from "@/lib/storage";
import HeroSlider from "@/components/HeroSlider";
import HomeNavWrapper from "@/components/HomeNavWrapper";
import ProductGrid from "@/components/ProductGrid";
import Footer from "@/components/Footer";

export default async function Home() {
  // Fetch settings server-side. Next.js deduplicates this with the
  // layout.tsx call in the same request.
  let banners: any[] = [];
  try {
    const settings = await storage.getSettings();
    banners = (settings as any)?.banners ?? [];
  } catch {
    banners = [];
  }

  return (
    <div className="flex flex-col w-full">
      {/* Constraints for centered content */}
      <div className="w-full max-w-[1440px] mx-auto flex flex-col relative px-4 md:px-8">
        {/* Navigation Bar — client component (needs useCart / useAuth) */}
        <HomeNavWrapper />

        {/* Hero Slider — client component that receives SSR'd banner data */}
        {banners.length > 0 && <HeroSlider banners={banners} />}
      </div>

      {/* Full Catalog Section */}
      <div className="mt-4 md:mt-16">
        <ProductGrid />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
