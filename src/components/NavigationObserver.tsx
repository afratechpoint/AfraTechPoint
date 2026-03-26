"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useUI } from "@/lib/ui";

export default function NavigationObserver() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setIsLoading } = useUI();

  // Reset loading state when pathname or searchParams change (navigation finished)
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, searchParams, setIsLoading]);

  useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest("a");

      if (
        anchor &&
        anchor.href &&
        anchor.target !== "_blank" &&
        anchor.origin === window.location.origin && // Internal link
        anchor.pathname !== pathname // Different page
      ) {
        // Only trigger for real navigations, not hash changes or same page clicks
        if (
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey &&
          !event.altKey &&
          event.button === 0
        ) {
          setIsLoading(true);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, [setIsLoading, pathname]);

  return null;
}
