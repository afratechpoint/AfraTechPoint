"use client";

import { useEffect, useRef, useCallback } from "react";
import { getToken, onMessage } from "firebase/messaging";
import { getPushMessaging } from "@/lib/firebase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";

export default function PushNotificationManager() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasRegistered = useRef(false);
  const debug = searchParams.get("debug") === "true";

  // --- Manual Permission Function (Mobile Compatibility) ---
  const triggerManualPermission = async (isForAdmin = false) => {
    const messaging = await getPushMessaging();
    if (!messaging) return false;
    
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Notification permission denied.");
        return false;
      }

      const token = await getToken(messaging, { 
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY || ""
      });

      if (token) {
        const uid = isForAdmin ? "admin" : user?.uid;
        if (!uid) return false;

        await fetch("/api/push-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid, token }),
        });
        
        toast.success("Notifications enabled successfully!");
        return true;
      }
    } catch (err) {
      console.error("[Push] Manual registration error:", err);
      toast.error("Failed to enable notifications.");
    }
    return false;
  };

  // Expose to window for other components to trigger
  useEffect(() => {
    (window as any).triggerPushPermission = triggerManualPermission;
  }, [user]);

  useEffect(() => {
    // console.log("[Push] Manager Effect Triggered. User:", user?.email);
    if (!user || hasRegistered.current) return;

    const setupPush = async () => {
      try {
        const messaging = await getPushMessaging();
        if (!messaging) return;
        
        // console.log("[Push] Requesting permission...");
        const permission = await Notification.requestPermission();
        
        if (permission !== "granted") {
          return;
        }

        // 2. Register Service Worker (Unified)
        // console.log("[Push] Registering Service Worker...");
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js", {
          scope: "/",
        });

        // Ensure we have the latest version
        await registration.update();
        
        // 3. Get FCM Token
        // console.log("[Push] Getting Token...");
        const token = await getToken(messaging!, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
          serviceWorkerRegistration: registration,
        });

        if (token) {
          // 4. Save token to server
          await fetch("/api/push-token", {
            method: "POST",
            body: JSON.stringify({ uid: user.uid, token }),
            headers: { "Content-Type": "application/json" },
          });

          // 5. Also save as 'admin' if user is admin
          const adminEmails = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "").toLowerCase().split(",");
          const userEmail = (user.email || "").toLowerCase();
          
          if (userEmail && adminEmails.includes(userEmail)) {
             await fetch("/api/push-token", {
              method: "POST",
              body: JSON.stringify({ uid: "admin", token }),
              headers: { "Content-Type": "application/json" },
            });
          }

          hasRegistered.current = true;
        }

        // Handle foreground messages with a nice toast
        onMessage(messaging!, (payload) => {
          console.log("[Push] Foreground message received:", payload);
          if (payload.notification) {
            // 1. Show the nice on-page toast
            toast(payload.notification.title, {
              description: payload.notification.body,
              action: payload.data?.url ? {
                label: "View",
                onClick: () => router.push(payload.data!.url),
              } : undefined,
              duration: 10000,
            });

            // 2. FORCE an OS-level System Notification even while viewing the page
            if (Notification.permission === "granted") {
              const options = {
                body: payload.notification.body,
                icon: payload.notification.icon || "/logo.png",
                tag: "atp-notification-fg",
                data: payload.data,
              };
              // This is what puts it in the Windows/Android Notification Center
              new Notification(payload.notification.title!, options);
            }
          }
        });

      } catch (error) {
        console.error("[Push] Error:", error);
      }
    };

    setupPush();
  }, [user, router]);

  // Debug Helper: Show a test button if ?debug=true
  if (debug) {
    return (
      <div className="fixed bottom-24 right-4 z-[200]">
        <button 
          onClick={() => {
            if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                type: "TEST_NOTIFICATION",
                title: "ATP Debug",
                body: "If you see this, OS pop-ups are WORKING!"
              });
              // Also try direct
               new Notification("ATP Direct Test", { body: "Testing direct browser notification." });
               toast.success("Manual notification triggered. Check your OS center.");
            } else {
              toast.error("Service worker not active or not controlling page.");
            }
          }}
          className="bg-black text-white px-4 py-2 rounded-full shadow-lg text-xs font-bold border border-white/20"
        >
          DEBUG: Test OS Notification
        </button>
      </div>
    );
  }

  return null;
}
