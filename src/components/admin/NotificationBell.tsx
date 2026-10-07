"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { Bell, Check, CheckCheck, ExternalLink, Package, UserPlus, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/lib/api-helper";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

function timeAgo(dateInput: string | Date) {
  try {
    const d = typeof dateInput === "string" ? new Date(dateInput).getTime() : dateInput.getTime();
    if (isNaN(d)) return "";
    const diff = Math.floor((Date.now() - d) / 1000);
    if (diff < 30) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 86400 * 2) return "Yesterday";
    return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function NotificationBell() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await authenticatedFetch("/api/notifications?recipient=admin&limit=15", {
        cache: "no-store",
      });
      if (!res.ok) return;

      const data = await res.json();
      if (data.notifications && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.isRead).length);
      }
    } catch (err) {
      console.error("Failed to fetch admin notifications:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // 1 minute poll
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Refresh when bell is opened
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;

    // Optimistic UI update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await authenticatedFetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true, recipient: "admin" }),
      });
    } catch (err) {
      console.error("Failed to mark all as read:", err);
      fetchNotifications();
    }
  };

  const markAsRead = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await authenticatedFetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleItemClick = (n: Notification) => {
    if (!n.isRead) {
      markAsRead(n.id);
    }
    setIsOpen(false);
    if (n.link) {
      router.push(n.link);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "new_order":
        return (
          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4" />
          </div>
        );
      case "new_user":
        return (
          <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <UserPlus className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
            <Info className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={`Admin notifications (${unreadCount} unread)`}
        className="p-2.5 rounded-full hover:bg-gray-100 active:scale-95 transition-all relative flex items-center justify-center text-gray-700 hover:text-black"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </motion.span>
        )}
      </button>

      {/* Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-[380px] max-w-[380px] max-h-[calc(100dvh-5.5rem)] bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-[100] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-gray-900 tracking-tight">Admin Alerts</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-600 border border-blue-100">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 min-h-0 overflow-y-auto divide-y divide-gray-50 overscroll-contain">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleItemClick(n)}
                    className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors group relative ${
                      !n.isRead
                        ? "bg-blue-50/40 hover:bg-blue-50/70"
                        : "hover:bg-gray-50/70"
                    }`}
                  >
                    {/* Icon */}
                    {getIcon(n.type)}

                    {/* Content */}
                    <div className="flex-1 min-w-0 pr-1">
                      <div className="flex items-start justify-between gap-1">
                        <p
                          className={`text-xs text-gray-900 line-clamp-1 ${
                            !n.isRead ? "font-black" : "font-semibold"
                          }`}
                        >
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1 border-t border-gray-100/50">
                        <span className="text-[10px] font-medium text-gray-400">
                          {timeAgo(n.createdAt)}
                        </span>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!n.isRead && (
                            <button
                              onClick={(e) => markAsRead(n.id, e)}
                              title="Mark as read"
                              className="p-1 hover:bg-gray-200/60 rounded-md text-emerald-600 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {n.link && (
                            <span className="p-1 text-gray-400">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center flex flex-col items-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mb-2.5">
                    <Bell className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-xs font-bold text-gray-700">No notifications yet</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    New orders and customer signups will appear here.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <Link
              href="/admin/notifications"
              className="block p-3 text-center text-xs font-bold text-gray-600 hover:text-black hover:bg-gray-50 transition-colors border-t border-gray-100 shrink-0 bg-white"
              onClick={() => setIsOpen(false)}
            >
              View all notifications →
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
