"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";

/**
 * Thin client wrapper that holds the home page search state
 * and passes it to Navbar. Keeping this isolated lets page.tsx
 * be a Server Component, which is critical for LCP performance.
 */
export default function HomeNavWrapper() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <Navbar
      searchEnabled={true}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
    />
  );
}
