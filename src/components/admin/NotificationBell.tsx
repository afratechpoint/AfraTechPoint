"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink, Package, UserPlus, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?recipient=admin&limit=10");
      const data = await res.json();
      if (data.notifications) {
        setNotifications(data.notifications);
        setUnreadCount(data.notifications.filter((n: Notification) => !n.isRead).length);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        body: JSON.stringify({ all: true, recipient: "admin" }),
      });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "POST",
        body: JSON.stringify({ id }),
      });
      fetchNotifications();
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "new_order": return <Package className="w-4 h-4 text-blue-500" />;
      case "new_user": return <UserPlus className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full hover:bg-gray-100 transition-colors relative"
      >
        <Bell className="w-6 h-6 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-gray-800 font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-500 hover:text-blue-600 transition-colors font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>

              <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors group relative ${
                      !n.isRead ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1">{getIcon(n.type)}</div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-800">{n.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-2 mt-1">{n.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[10px] text-gray-400">
                            {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link
                              href={n.link}
                              onClick={() => setIsOpen(false)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <ExternalLink className="w-3 h-3 text-blue-500" />
                            </Link>
                            {!n.isRead && (
                              <button
                                onClick={() => markAsRead(n.id)}
                                className="p-1 hover:bg-gray-200 rounded"
                              >
                                <Check className="w-3 h-3 text-green-500" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No notifications yet</p>
                </div>
              )}
              </div>

            <Link
              href="/admin/notifications"
              className="block p-3 text-center text-xs text-gray-500 hover:text-gray-800 hover:bg-gray-50 transition-colors border-t border-gray-100"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
