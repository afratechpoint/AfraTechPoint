"use client";

import React, { useState, useEffect, useRef } from "react";
import { Bell, Check, ExternalLink, Package, Info, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string;
}

export default function ShopNotificationBell() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await fetch(`/api/notifications?recipient=${user.uid}&limit=10`);
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
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [user]);

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
    if (!user) return;
    try {
      await fetch("/api/notifications", {
        method: "POST",
        body: JSON.stringify({ all: true, recipient: user.uid }),
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
      case "order_status_update": return <Package className="w-4 h-4 text-blue-500" />;
      case "payment_received": return <ShoppingBag className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2.5 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-all relative group"
      >
        <Bell size={20} className="text-gray-700 group-hover:text-black" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
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
            className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-[110] overflow-hidden"
          >
            <div className="p-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-black text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[350px] overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors group relative ${
                      !n.isRead ? "bg-blue-50/30" : ""
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="mt-1 shrink-0">{getIcon(n.type)}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{n.title}</p>
                        <p className="text-[11px] text-gray-500 line-clamp-2 mt-0.5 leading-relaxed">{n.message}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-[9px] font-bold text-gray-400">
                            {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })} at {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <div className="flex gap-2">
                            <Link
                              href={n.link}
                              onClick={() => setIsOpen(false)}
                              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                            </Link>
                            {!n.isRead && (
                              <button
                                onClick={() => markAsRead(n.id)}
                                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <Check className="w-3.5 h-3.5 text-green-500" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Bell className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-xs font-bold text-gray-400">No notifications yet</p>
                </div>
              )}
            </div>

            <Link
              href="/account"
              className="block p-3 text-center text-[10px] font-black uppercase tracking-[0.1em] text-gray-400 hover:text-black hover:bg-gray-50 transition-all border-t border-gray-50"
              onClick={() => setIsOpen(false)}
            >
              View My Account
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
