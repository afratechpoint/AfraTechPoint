"use client";

import { useEffect, useRef } from "react";

/**
 * TrafficTracker — A silent client-side component that increments
 * the website's traffic counter in Firestore. 
 * Uses sessionStorage to prevent multiple increments during the same session.
 */
export default function TrafficTracker() {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;

    // Limit to once per day per browser (saves Firestore writes significantly)
    const today = new Date().toISOString().split("T")[0]; // "2026-03-29"
    const storageKey = `afra_visited_${today}`;
    if (localStorage.getItem(storageKey)) return;

    tracked.current = true;

    fetch("/api/stats/traffic", { method: "POST" })
      .then(() => {
        localStorage.setItem(storageKey, "1");
        // Clean up yesterday's key to prevent localStorage growth
        const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
        localStorage.removeItem(`afra_visited_${yesterday}`);
      })
      .catch(() => {}); // Silent fail - traffic tracking is non-critical
  }, []);

  return null; // Silent component
}
