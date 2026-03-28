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
    // Only track if not already tracked in this session and only once per mount
    if (tracked.current) return;
    
    const sessionKey = "afra_site_visited";
    if (sessionStorage.getItem(sessionKey)) return;

    tracked.current = true;

    // Fire and forget
    fetch("/api/stats/traffic", { method: "POST" })
      .then(() => {
        sessionStorage.setItem(sessionKey, "true");
      })
      .catch((err) => console.error("[TrafficTracker] Failed to record visit:", err));
  }, []);

  return null; // Silent component
}
