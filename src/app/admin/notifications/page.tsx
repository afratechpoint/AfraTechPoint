"use client";

import React, { useEffect, useState } from "react";
import { Bell, Check, CheckCheck, Package, UserPlus, Info, ExternalLink, RefreshCw, Trash2, X } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { authenticatedFetch } from "@/lib/api-helper";

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  isRead: boolean;
  createdAt: string | Date;
}

const getIcon = (type: string) => {
  switch (type) {
    case "new_order": return <Package className="w-5 h-5 text-blue-500" />;
    case "order_status_update": return <Package className="w-5 h-5 text-violet-500" />;
    case "new_user": return <UserPlus className="w-5 h-5 text-green-500" />;
    default: return <Info className="w-5 h-5 text-gray-400" />;
  }
};

const getTypeBg = (type: string) => {
  switch (type) {
    case "new_order": return "bg-blue-50";
    case "order_status_update": return "bg-violet-50";
    case "new_user": return "bg-green-50";
    default: return "bg-gray-50";
  }
};

function timeAgo(date: string | Date) {
  const now = Date.now();
  const d = typeof date === "string" ? new Date(date).getTime() : (date as Date).getTime();
  const diff = Math.floor((now - d) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading]             = useState(true);
  const [markingAll, setMarkingAll]       = useState(false);
  const [clearingAll, setClearingAll]     = useState(false);
  const [filter, setFilter]               = useState<"all" | "unread">("all");
  const [deletingId, setDeletingId]       = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await authenticatedFetch("/api/notifications?recipient=admin&limit=50", { cache: "no-store" });
      const data = await res.json();
      if (data.notifications) setNotifications(data.notifications);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifs(); }, []);

  const markRead = async (id: string) => {
    await authenticatedFetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllRead = async () => {
    setMarkingAll(true);
    await authenticatedFetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true, recipient: "admin" }),
    });
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setMarkingAll(false);
  };

  const deleteOne = async (id: string) => {
    setDeletingId(id);
    await authenticatedFetch(`/api/notifications?id=${id}`, { method: "DELETE" });
    setNotifications(prev => prev.filter(n => n.id !== id));
    setDeletingId(null);
  };

  const clearAll = async () => {
    setClearingAll(true);
    await authenticatedFetch("/api/notifications?all=true&recipient=admin", { method: "DELETE" });
    setNotifications([]);
    setClearingAll(false);
    setShowClearConfirm(false);
  };

  const filtered = filter === "unread"
    ? notifications.filter(n => !n.isRead)
    : notifications;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            <Bell size={24} /> Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            {notifications.length > 0 && ` · ${notifications.length} total`}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchNotifs}
            disabled={loading}
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-500 hover:text-black hover:border-black transition-all disabled:opacity-40"
            title="Refresh"
          >
            <RefreshCw size={14} className={cn(loading && "animate-spin")} />
          </button>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              disabled={markingAll}
              className="flex items-center gap-1.5 text-xs font-bold bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 transition-all disabled:opacity-40"
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 text-xs font-bold bg-red-50 text-red-500 border border-red-100 px-4 py-2 rounded-xl hover:bg-red-100 transition-all"
            >
              <Trash2 size={13} /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Clear All Confirm Modal */}
      <AnimatePresence>
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowClearConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} className="text-red-500" />
              </div>
              <h2 className="text-lg font-black text-gray-900 mb-1">Clear all notifications?</h2>
              <p className="text-sm text-gray-400 mb-6">This will permanently delete all {notifications.length} notifications.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={clearAll}
                  disabled={clearingAll}
                  className="flex-1 py-2.5 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-all disabled:opacity-40"
                >
                  {clearingAll ? "Clearing..." : "Yes, clear all"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "unread"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-bold capitalize transition-all",
              filter === tab ? "bg-black text-white" : "bg-white border border-gray-200 text-gray-500 hover:border-black hover:text-black"
            )}
          >
            {tab} {tab === "unread" && unreadCount > 0 && `(${unreadCount})`}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="w-7 h-7 border-4 border-gray-100 border-t-gray-700 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center gap-3 text-gray-400">
            <Bell size={36} className="text-gray-200" />
            <p className="text-sm font-medium">
              {filter === "unread" ? "No unread notifications" : "No notifications yet"}
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filtered.map((n, i) => (
              <motion.div
                key={n.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: 40, height: 0 }}
                transition={{ delay: i * 0.03 }}
                className={cn(
                  "flex items-start gap-4 px-6 py-4 border-b border-gray-50 last:border-0 transition-colors group",
                  !n.isRead ? "bg-blue-50/40" : "hover:bg-gray-50/50"
                )}
              >
                {/* Icon */}
                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5", getTypeBg(n.type))}>
                  {getIcon(n.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn("text-sm font-bold text-gray-900", !n.isRead && "font-black")}>
                      {n.title}
                      {!n.isRead && <span className="ml-2 inline-block w-1.5 h-1.5 bg-blue-500 rounded-full align-middle" />}
                    </p>
                    <span className="text-[10px] text-gray-400 font-medium shrink-0">{timeAgo(n.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-2">
                    {n.link && (
                      <Link
                        href={n.link}
                        className="flex items-center gap-1 text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        <ExternalLink size={10} /> View details
                      </Link>
                    )}
                    {!n.isRead && (
                      <button
                        onClick={() => markRead(n.id)}
                        className="flex items-center gap-1 text-[10px] font-bold text-gray-400 hover:text-green-600 transition-colors"
                      >
                        <Check size={10} /> Mark read
                      </button>
                    )}
                  </div>
                </div>

                {/* Delete button — visible on hover */}
                <button
                  onClick={() => deleteOne(n.id)}
                  disabled={deletingId === n.id}
                  title="Delete notification"
                  className="shrink-0 opacity-0 group-hover:opacity-100 p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all disabled:opacity-40"
                >
                  {deletingId === n.id
                    ? <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" />
                    : <X size={14} />
                  }
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
