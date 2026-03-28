"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, ShieldCheck, ShieldAlert, LogOut,
  Package, ChevronRight, Clock, Pencil, Check, X,
  Phone, MapPin, Info
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { updateProfile } from "firebase/auth";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useUI } from "@/lib/ui";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/components/SettingsProvider";
import PremiumLoader from "@/components/PremiumLoader";

const STATUS_STYLES: Record<string, string> = {
  Delivered:  "bg-green-50 text-green-600 border-green-100",
  Processing: "bg-blue-50 text-blue-600 border-blue-100",
  Shipped:    "bg-yellow-50 text-yellow-600 border-yellow-100",
  Cancelled:  "bg-red-50 text-red-500 border-red-100",
};

type Tab = "profile" | "orders";

interface Order {
  id: string;
  createdAt: string;
  total: number;
  status: string;
  items: { name: string; quantity: number; price: number }[];
}

function AccountContent() {
    const { user, loading, logout } = useAuth();
  const router   = useRouter();
  const searchParams = useSearchParams();
  const settings = useSettings();
  const [tab, setTab] = useState<Tab>((searchParams.get("tab") as Tab) || "profile");

  // ── Edit state ──────────────────────────────────────────────────
  const [isEditing, setIsEditing]     = useState(false);
  const [isSaving, setIsSaving]       = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone]             = useState("");
  const [address, setAddress]         = useState("");
  const [bio, setBio]                 = useState("");
  const [imgError, setImgError]       = useState(false);

  // ── Real orders ─────────────────────────────────────────────────
  const [orders, setOrders]           = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Pre-fill profile fields from Firestore (PERSISTENT)
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName ?? "");
      
      // Fetch the persistent profile from Firestore
      fetch(`/api/profile?uid=${user.uid}`)
        .then(r => r.json())
        .then(data => {
            if (data) {
                setPhone(data.phone ?? "");
                setAddress(data.address ?? "");
                setBio(data.bio ?? "");
            }
        })
        .catch(err => console.error("Failed to load profile from Firestore:", err));
    }
  }, [user]);

  // Fetch real orders when orders tab is opened
  useEffect(() => {
    if (tab === "orders" && user) {
      setOrdersLoading(true);
      fetch(`/api/orders?userId=${user.uid}`)
        .then(r => r.json())
        .then((data: Order[]) => setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())))
        .catch(() => toast.error("Failed to load orders."))
        .finally(() => setOrdersLoading(false));
    }
  }, [tab, user]);

  // ── Auth guard ──────────────────────────────────────────────────
  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) {
    return <PremiumLoader />;
  }

  // ── Save profile ────────────────────────────────────────────────
  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }
    setIsSaving(true);
    try {
      // 1. Update Firebase displayName (Authentication profile)
      await updateProfile(user, { displayName: displayName.trim() });

      // 2. Persist extra fields (phone, address, bio) in Firestore for all devices
      await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          uid: user.uid, 
          data: { phone, address, bio, displayName } 
        }),
      });

      toast.success("Profile saved to database!");
      setIsEditing(false);
    } catch {
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Re-trigger the initial fetch logic by simply resetting the state or re-fetching
    setIsEditing(false);
    // (In a real app, you might want to re-run the fetch useEffect here)
    if (user) {
      fetch(`/api/profile?uid=${user.uid}`)
        .then(r => r.json())
        .then(data => {
            setDisplayName(user.displayName ?? "");
            if (data) {
                setPhone(data.phone ?? "");
                setAddress(data.address ?? "");
                setBio(data.bio ?? "");
            }
        });
    }
  };

  const handleSignOut = async () => { await logout(); router.push("/"); };

  const currency   = settings?.currencySymbol ?? "৳";
  const initials   = ((user.displayName ?? user.email ?? "U")[0]).toUpperCase();
  const joinedDate = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f8f9fa]">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col relative px-4 md:px-8">
        <Navbar searchEnabled={false} />

        <main className="py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ══ Sidebar ══════════════════════════════════════════ */}
            <aside className="lg:col-span-3 space-y-4">

              {/* Avatar card */}
              <div className="bg-white rounded-[2rem] border border-gray-100 p-6 flex flex-col items-center text-center shadow-sm">
                <div className="relative mb-4">
                  {user.photoURL && !imgError ? (
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg">
                      <Image 
                        src={user.photoURL} 
                        alt="Profile" 
                        width={80} 
                        height={80} 
                        className="object-cover" 
                        unoptimized 
                        onError={() => setImgError(true)}
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl font-black">{initials}</span>
                    </div>
                  )}
                  {/* Google badge */}
                  {user.providerData?.[0]?.providerId === "google.com" && (
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow border border-gray-100">
                      <svg viewBox="0 0 24 24" className="w-4 h-4">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    </div>
                  )}
                </div>

                <h2 className="font-black text-gray-900 text-lg tracking-tight">
                  {user.displayName ?? "My Account"}
                </h2>
                <p className="text-xs text-gray-400 font-medium truncate max-w-full mt-1">{user.email}</p>

                {user.emailVerified ? (
                  <div className="flex items-center gap-1.5 mt-2 text-green-600 text-[10px] font-bold">
                    <ShieldCheck size={12} /> Verified Account
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-2 text-orange-500 text-[10px] font-bold">
                    <ShieldAlert size={12} /> Email not verified
                  </div>
                )}
              </div>

              {/* Navigation */}
              <nav className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                {([
                  { id: "profile", label: "My Profile", icon: User },
                  { id: "orders",  label: "Order History", icon: Package },
                ] as { id: Tab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`w-full flex items-center justify-between px-6 py-4 text-sm font-bold transition-all border-b border-gray-50 last:border-0 ${
                      tab === id ? "text-black bg-gray-50" : "text-gray-400 hover:text-black hover:bg-gray-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3"><Icon size={16} />{label}</div>
                    <ChevronRight size={14} />
                  </button>
                ))}
              </nav>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 h-12 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </aside>

            {/* ══ Main panel ════════════════════════════════════════ */}
            <div className="lg:col-span-9">
              <AnimatePresence mode="wait">

                {/* ── Profile Tab ── */}
                {tab === "profile" && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8 space-y-6"
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Profile Information</h3>
                      {!isEditing ? (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-black hover:text-white text-gray-600 text-xs font-bold border border-gray-100 hover:border-black transition-all"
                        >
                          <Pencil size={14} /> Edit Profile
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={handleCancel}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 text-gray-500 text-xs font-bold border border-gray-100 hover:bg-gray-100 transition-all"
                          >
                            <X size={14} /> Cancel
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-all disabled:opacity-60"
                          >
                            {isSaving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={14} />}
                            Save
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Read-only info (from Google / Firebase) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {/* Full Name — editable */}
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                          <User size={16} className="text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Full Name</p>
                          {isEditing ? (
                            <input
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              className="mt-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black"
                            />
                          ) : (
                            <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{user.displayName ?? "—"}</p>
                          )}
                        </div>
                      </div>

                      {/* Email — read-only */}
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                          <Mail size={16} className="text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Email Address</p>
                          <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{user.email ?? "—"}</p>
                        </div>
                      </div>

                      {/* Phone — editable */}
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                          <Phone size={16} className="text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Phone Number</p>
                          {isEditing ? (
                            <input
                              value={phone}
                              onChange={(e) => setPhone(e.target.value)}
                              placeholder="+880 17XX XXX XXX"
                              className="mt-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black"
                            />
                          ) : (
                            <p className="text-sm font-bold text-gray-900 mt-0.5">{phone || <span className="text-gray-400 font-medium">Not set</span>}</p>
                          )}
                        </div>
                      </div>

                      {/* Member since — read-only */}
                      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
                          <Clock size={16} className="text-gray-400" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Member Since</p>
                          <p className="text-sm font-bold text-gray-900 mt-0.5">{joinedDate}</p>
                        </div>
                      </div>
                    </div>

                    {/* Address — full width editable */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 shrink-0 mt-1">
                        <MapPin size={16} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Delivery Address</p>
                        {isEditing ? (
                          <textarea
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="House 12, Road 5, Dhaka 1200"
                            rows={2}
                            className="mt-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black resize-none"
                          />
                        ) : (
                          <p className="text-sm font-bold text-gray-900 mt-0.5">{address || <span className="text-gray-400 font-medium">Not set</span>}</p>
                        )}
                      </div>
                    </div>

                    {/* Bio — full width editable */}
                    <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 shrink-0 mt-1">
                        <Info size={16} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">About Me</p>
                        {isEditing ? (
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Tell us a bit about yourself…"
                            rows={2}
                            className="mt-1 w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black resize-none"
                          />
                        ) : (
                          <p className="text-sm font-bold text-gray-900 mt-0.5 leading-relaxed">{bio || <span className="text-gray-400 font-medium">Not set</span>}</p>
                        )}
                      </div>
                    </div>

                  </motion.div>
                )}

                {/* ── Orders Tab ── */}
                {tab === "orders" && (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8"
                  >
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6">Order History</h3>

                    {ordersLoading ? (
                        <div className="flex items-center justify-center py-16">
                          <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-16">
                          <Package size={48} className="mx-auto text-gray-200 mb-4" />
                          <p className="text-gray-500 font-bold">No orders yet.</p>
                          <p className="text-gray-400 text-xs mt-1">Your orders will appear here after checkout.</p>
                          <Link href="/shop" className="mt-5 inline-block h-10 px-6 bg-black text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors leading-10">Start Shopping</Link>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {orders.map((order: Order) => {
                            const itemCount = Array.isArray(order.items)
                              ? order.items.reduce((s, i) => s + (i.quantity ?? 1), 0)
                              : 0;
                            const shortId      = order.id.slice(0, 8).toUpperCase();
                            const payStatus    = (order as any).paymentStatus ?? "pending";
                            const method       = (order as any).payment?.method;

                            const payBadge: Record<string, string> = {
                              pending:   "bg-amber-50 text-amber-600 border-amber-200",
                              confirmed: "bg-green-50 text-green-600 border-green-200",
                              cancelled: "bg-red-50 text-red-500 border-red-200",
                            };

                            return (
                              <Link key={order.id} href={`/account/orders/${order.id}`}
                                className="block p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all space-y-3 group">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center shrink-0">
                                        <Package size={15} className="text-white" />
                                      </div>
                                      <div>
                                        <p className="text-sm font-black text-gray-900">#{shortId}</p>
                                        <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                          {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                          {" · "}{itemCount} item{itemCount !== 1 ? "s" : ""}
                                          {method && <span className="ml-1">· {method}</span>}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-black text-gray-900">{currency}{Number(order.total).toFixed(2)}</span>
                                      <ChevronRight size={14} className="text-gray-300 group-hover:text-black transition-colors" />
                                    </div>
                                  </div>

                                {/* Status badges */}
                                <div className="flex items-center gap-2 flex-wrap">
                                  {/* Payment status */}
                                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${payBadge[payStatus] ?? "bg-gray-50 text-gray-500 border-gray-100"}`}>
                                    {payStatus === "pending" ? "Payment Pending" : payStatus === "confirmed" ? "Payment Confirmed" : "Cancelled"}
                                  </span>
                                  {/* Order status */}
                                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${STATUS_STYLES[order.status] ?? "bg-gray-50 text-gray-500 border-gray-100"}`}>
                                    {order.status}
                                  </span>
                                </div>

                                {/* Pending notice */}
                                {payStatus === "pending" && (
                                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                                    <p className="text-amber-700 text-[10px] font-medium">
                                      Payment verification in progress — usually takes a few minutes.
                                    </p>
                                  </div>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<PremiumLoader />}>
      <AccountContent />
    </Suspense>
  );
}
