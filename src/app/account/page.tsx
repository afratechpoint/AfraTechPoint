"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, ShieldCheck, ShieldAlert, LogOut,
  Package, ChevronRight, Clock, Pencil, Check, X,
  Phone, MapPin, Info, ShoppingBag, TrendingUp,
  Calendar, Home, Star, ArrowRight, Truck, CreditCard
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { updateProfile } from "firebase/auth";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings } from "@/components/SettingsProvider";
import PremiumLoader from "@/components/PremiumLoader";

type Tab = "profile" | "orders";

interface OrderItem { name: string; quantity: number; price: number; image?: string; variantName?: string; }

interface Order {
  id: string;
  createdAt: string;
  total?: number;
  totalAmount?: number;
  subtotal?: number;
  deliveryCharge?: number;
  status?: string;
  orderStatus?: string;
  paymentStatus?: string;
  paymentMethod?: string;
  payment?: { method?: string };
  items: OrderItem[];
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; dot: string }> = {
  Processing: { label: "Processing",  bg: "bg-blue-50 text-blue-600 border-blue-100",   dot: "bg-blue-500"  },
  Shipped:    { label: "Shipped",     bg: "bg-purple-50 text-purple-600 border-purple-100", dot: "bg-purple-500" },
  Delivered:  { label: "Delivered",   bg: "bg-green-50 text-green-600 border-green-100",  dot: "bg-green-500"  },
  Cancelled:  { label: "Cancelled",   bg: "bg-red-50 text-red-500 border-red-100",      dot: "bg-red-500"    },
  pending:    { label: "Pending",     bg: "bg-amber-50 text-amber-600 border-amber-100",  dot: "bg-amber-500"  },
  processing: { label: "Processing",  bg: "bg-blue-50 text-blue-600 border-blue-100",   dot: "bg-blue-500"  },
  shipped:    { label: "Shipped",     bg: "bg-purple-50 text-purple-600 border-purple-100", dot: "bg-purple-500" },
  delivered:  { label: "Delivered",   bg: "bg-green-50 text-green-600 border-green-100",  dot: "bg-green-500"  },
  cancelled:  { label: "Cancelled",   bg: "bg-red-50 text-red-500 border-red-100",      dot: "bg-red-500"    },
};

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex items-center gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
        <p className="text-lg font-black text-gray-900 leading-none mt-0.5">{value}</p>
        {sub && <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function AccountContent() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const settings = useSettings();
  const [tab, setTab] = useState<Tab>((searchParams.get("tab") as Tab) || "profile");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving]   = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone]     = useState("");
  const [address, setAddress] = useState("");
  const [bio, setBio]         = useState("");
  const [imgError, setImgError] = useState(false);

  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (user && !isEditing) {
      setDisplayName(user.displayName ?? "");

      // 1. First, check for local data in browser storage (Immediate load)
      const localData = localStorage.getItem(`afra_profile_${user.uid}`);
      if (localData) {
        try {
          const parsed = JSON.parse(localData);
          if (parsed.displayName) setDisplayName(parsed.displayName);
          setPhone(parsed.phone ?? "");
          setAddress(parsed.address ?? "");
          setBio(parsed.bio ?? "");
          console.log("[Account] Initialized with local browser data.");
        } catch (e) {}
      }

      // 2. Then, fetch from Server to sync
      fetch(`/api/profile?uid=${user.uid}`)
        .then(r => r.json())
        .then(data => {
          if (data && Object.keys(data).length > 0) {
            if (data.displayName) setDisplayName(data.displayName);
            setPhone(data.phone ?? "");
            setAddress(data.address ?? "");
            setBio(data.bio ?? "");
            // Sync local storage with server data
            localStorage.setItem(`afra_profile_${user.uid}`, JSON.stringify(data));
          }
        })
        .catch(() => {
          console.warn("[Account] Server fetch failed. Using local browser data only.");
        });
    }
  }, [user, isEditing]);

  useEffect(() => {
    if (tab === "orders" && user) {
      setOrdersLoading(true);
      fetch(`/api/orders?userId=${user.uid}`)
        .then(async r => {
          if (!r.ok) {
            const err = await r.json().catch(() => ({}));
            throw new Error(err?.error || `Server error ${r.status}`);
          }
          return r.json();
        })
        .then((data) => {
          if (!Array.isArray(data)) {
            setOrders([]);
            return;
          }
          setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        })
        .catch((err) => {
          console.error("Orders fetch failed:", err);
          toast.error("Could not load orders. Please try again later.", { description: "This may be a temporary issue." });
        })
        .finally(() => setOrdersLoading(false));
    }
  }, [tab, user]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  if (loading || !user) return <PremiumLoader />;

  const handleSave = async () => {
    if (!displayName.trim()) { toast.error("Name cannot be empty."); return; }
    setIsSaving(true);
    
    // Prepare data
    const profileData = { phone, address, bio, displayName };

    try {
      // 1. Update Auth Profile
      await updateProfile(user, { displayName: displayName.trim() });

      // 2. Attempt Update to Server (will fail if quota or read-only)
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: user.uid, data: profileData }),
      });

      if (!res.ok) throw new Error("Server limit reached");

      // Success
      localStorage.setItem(`afra_profile_${user.uid}`, JSON.stringify(profileData));
      toast.success("Profile saved!");
      setIsEditing(false);

    } catch (err) {
      console.error("Save error:", err);
      
      // FALLBACK: Save to LocalBrowser Storage
      localStorage.setItem(`afra_profile_${user.uid}`, JSON.stringify(profileData));
      toast.success("Profile saved locally (Server limit reached)");
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetch(`/api/profile?uid=${user.uid}`)
      .then(r => r.json())
      .then(data => {
        setDisplayName(user.displayName ?? "");
        if (data) { setPhone(data.phone ?? ""); setAddress(data.address ?? ""); setBio(data.bio ?? ""); }
      });
  };

  const currency  = settings?.currencySymbol ?? "৳";
  const initials  = ((user.displayName ?? user.email ?? "U")[0]).toUpperCase();
  const joined    = user.metadata.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  // Compute stats from orders (if loaded)
  const totalSpent = orders.reduce((s, o) => s + (o.totalAmount ?? o.total ?? 0), 0);
  const deliveredCount = orders.filter(o => (o.status ?? o.orderStatus ?? "").toLowerCase() === "delivered").length;

  const fieldRow = (icon: any, label: string, content: React.ReactNode) => {
    const Icon = icon;
    return (
      <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm border border-gray-100 shrink-0">
          <Icon size={16} className="text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
          {content}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full min-h-screen bg-[#f5f6f8]">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col px-4 md:px-8">
        <Navbar searchEnabled={false} />

        <main className="py-6 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* ══ Sidebar ════════════════════════════════════════════ */}
            <aside className="lg:col-span-3 space-y-4">

              {/* Profile card */}
              <div className="bg-white rounded-[2rem] border border-gray-100 p-6 flex flex-col items-center text-center shadow-sm">
                <div className="relative mb-4">
                  {user.photoURL && !imgError ? (
                    <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-xl ring-2 ring-gray-100">
                      <Image src={user.photoURL} alt="Profile" width={80} height={80} className="object-cover" unoptimized onError={() => setImgError(true)} />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center shadow-xl">
                      <span className="text-white text-2xl font-black">{initials}</span>
                    </div>
                  )}
                  {/* Provider badge */}
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
                <h2 className="font-black text-gray-900 text-base tracking-tight">{user.displayName ?? "My Account"}</h2>
                <p className="text-xs text-gray-400 font-medium truncate max-w-full mt-1">{user.email}</p>
                {user.emailVerified ? (
                  <div className="flex items-center gap-1.5 mt-2 bg-green-50 text-green-600 text-[10px] font-bold px-3 py-1 rounded-full border border-green-100">
                    <ShieldCheck size={11} /> Verified Account
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 mt-2 bg-orange-50 text-orange-500 text-[10px] font-bold px-3 py-1 rounded-full border border-orange-100">
                    <ShieldAlert size={11} /> Email not verified
                  </div>
                )}
                <div className="w-full mt-4 pt-4 border-t border-gray-50 flex items-center gap-2 text-[10px] text-gray-400 justify-center">
                  <Calendar size={10} /> Member since {joined}
                </div>
              </div>

              {/* Navigation */}
              <nav className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden shadow-sm">
                {([
                  { id: "profile", label: "My Profile",    icon: User,    desc: "Personal info & settings" },
                  { id: "orders",  label: "Order History",  icon: Package, desc: "Track your purchases" },
                ] as { id: Tab; label: string; icon: any; desc: string }[]).map(({ id, label, icon: Icon, desc }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`w-full flex items-center justify-between px-5 py-4 text-left border-b border-gray-50 last:border-0 transition-all ${
                      tab === id ? "bg-gray-50 text-black" : "text-gray-500 hover:bg-gray-50/50 hover:text-black"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${tab === id ? "bg-black text-white" : "bg-gray-100 text-gray-500"}`}>
                        <Icon size={15} />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold">{label}</p>
                        <p className="text-[9px] text-gray-400 font-medium">{desc}</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className={tab === id ? "text-black" : "text-gray-300"} />
                  </button>
                ))}
              </nav>

              {/* Quick Stats (only when orders loaded) */}
              {orders.length > 0 && (
                <div className="bg-white rounded-[2rem] border border-gray-100 p-5 shadow-sm space-y-3">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Your Stats</p>
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-2"><ShoppingBag size={12} /> Total Orders</span>
                      <span className="text-sm font-black text-gray-900">{orders.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 flex items-center gap-2"><Check size={12} className="text-green-500" /> Delivered</span>
                      <span className="text-sm font-black text-green-600">{deliveredCount}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-50 pt-2.5">
                      <span className="text-xs text-gray-500 flex items-center gap-2"><TrendingUp size={12} /> Total Spent</span>
                      <span className="text-sm font-black text-gray-900">{currency}{totalSpent.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Sign Out */}
              <button
                onClick={async () => { await logout(); router.push("/"); }}
                className="w-full flex items-center justify-center gap-2 h-12 bg-white border border-gray-100 rounded-2xl text-sm font-bold text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 transition-all shadow-sm"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </aside>

            {/* ══ Main Content ════════════════════════════════════════ */}
            <div className="lg:col-span-9">
              <AnimatePresence mode="wait">

                {/* ── Profile Tab ── */}
                {tab === "profile" && (
                  <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5">

                    {/* Profile Info Card */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">

                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-black text-gray-900">Profile Information</h3>
                          <p className="text-xs text-gray-400 mt-0.5">Manage your personal details</p>
                        </div>
                        {!isEditing ? (
                          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 hover:bg-black hover:text-white text-gray-600 text-xs font-bold border border-gray-100 hover:border-black transition-all">
                            <Pencil size={13} /> Edit Profile
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button onClick={handleCancel} disabled={isSaving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 text-gray-500 text-xs font-bold border border-gray-100 hover:bg-gray-100 transition-all">
                              <X size={13} /> Cancel
                            </button>
                            <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-all disabled:opacity-60">
                              {isSaving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Check size={13} />}
                              Save Changes
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {fieldRow(User, "Full Name",
                          isEditing
                            ? <input value={displayName} onChange={e => setDisplayName(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black" />
                            : <p className="text-sm font-bold text-gray-900 truncate">{user.displayName ?? "—"}</p>
                        )}
                        {fieldRow(Mail, "Email Address",
                          <p className="text-sm font-bold text-gray-900 truncate">{user.email ?? "—"}</p>
                        )}
                        {fieldRow(Phone, "Phone Number",
                          isEditing
                            ? <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+880 17XX XXX XXX" className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black" />
                            : <p className="text-sm font-bold text-gray-900">{phone || <span className="text-gray-400 font-medium">Not set</span>}</p>
                        )}
                        {fieldRow(Calendar, "Member Since",
                          <p className="text-sm font-bold text-gray-900">{joined}</p>
                        )}
                      </div>

                      <div className="mt-3 space-y-3">
                        {fieldRow(MapPin, "Delivery Address",
                          isEditing
                            ? <textarea value={address} onChange={e => setAddress(e.target.value)} placeholder="House 12, Road 5, Dhaka 1200" rows={2} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black resize-none" />
                            : <p className="text-sm font-bold text-gray-900">{address || <span className="text-gray-400 font-medium">Not set</span>}</p>
                        )}
                        {fieldRow(Info, "About Me",
                          isEditing
                            ? <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us about yourself…" rows={2} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold text-gray-900 outline-none focus:ring-2 focus:ring-black resize-none" />
                            : <p className="text-sm font-bold text-gray-900 leading-relaxed">{bio || <span className="text-gray-400 font-medium">Not set</span>}</p>
                        )}
                      </div>
                    </div>

                    {/* Account Security Card */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                      <h3 className="text-sm font-black text-gray-900 mb-4">Account Security</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${user.emailVerified ? "bg-green-50" : "bg-orange-50"}`}>
                            <ShieldCheck size={16} className={user.emailVerified ? "text-green-600" : "text-orange-500"} />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Email Verification</p>
                            <p className={`text-xs font-black mt-0.5 ${user.emailVerified ? "text-green-600" : "text-orange-500"}`}>
                              {user.emailVerified ? "Verified" : "Not Verified"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                            <User size={16} className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Sign-in Method</p>
                            <p className="text-xs font-black mt-0.5 text-gray-900">
                              {user.providerData?.[0]?.providerId === "google.com" ? "Google Account" : "Email & Password"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Links */}
                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6">
                      <h3 className="text-sm font-black text-gray-900 mb-4">Quick Links</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          { href: "/shop",           label: "Browse Products",  icon: ShoppingBag, color: "bg-blue-50 text-blue-600" },
                          { href: "/account?tab=orders", label: "My Orders",   icon: Package,     color: "bg-purple-50 text-purple-600" },
                          { href: "/contact",        label: "Contact Support",  icon: Home,        color: "bg-green-50 text-green-600" },
                        ].map(({ href, label, icon: Icon, color }) => (
                          <Link key={href} href={href} className="flex items-center justify-between p-3.5 bg-gray-50 hover:bg-gray-100 rounded-2xl border border-gray-100 transition-all group">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}><Icon size={14} /></div>
                              <span className="text-xs font-bold text-gray-700">{label}</span>
                            </div>
                            <ArrowRight size={13} className="text-gray-300 group-hover:text-black transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* ── Orders Tab ── */}
                {tab === "orders" && (
                  <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>

                    <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-6 md:p-8">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h3 className="text-lg font-black text-gray-900">Order History</h3>
                          <p className="text-xs text-gray-400 mt-0.5">{orders.length} order{orders.length !== 1 ? "s" : ""} found</p>
                        </div>
                        <Link href="/shop" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-black text-white text-xs font-bold hover:bg-gray-800 transition-all">
                          <ShoppingBag size={13} /> Shop More
                        </Link>
                      </div>

                      {ordersLoading ? (
                        <div className="flex items-center justify-center py-16">
                          <div className="w-8 h-8 border-4 border-gray-100 border-t-black rounded-full animate-spin" />
                        </div>
                      ) : orders.length === 0 ? (
                        <div className="text-center py-16">
                          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Package size={36} className="text-gray-200" />
                          </div>
                          <p className="text-gray-600 font-bold text-lg">No orders yet</p>
                          <p className="text-gray-400 text-sm mt-1 mb-6">Your orders will appear here after checkout.</p>
                          <Link href="/shop" className="inline-flex items-center gap-2 h-11 px-6 bg-black text-white text-sm font-black rounded-xl hover:bg-gray-800 transition-colors">
                            <ShoppingBag size={16} /> Start Shopping
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {orders.map((order) => {
                            const ordStatus = order.status ?? order.orderStatus ?? "pending";
                            const payStatus = order.paymentStatus ?? "pending";
                            const statusCfg = STATUS_CONFIG[ordStatus] ?? STATUS_CONFIG.pending;
                            const total = order.totalAmount ?? order.total ?? 0;
                            const subtotal = order.subtotal ?? total;
                            const delivery = order.deliveryCharge ?? 0;
                            const pmtMethod = order.payment?.method ?? order.paymentMethod ?? "—";
                            const shortId = order.id.slice(0, 8).toUpperCase();
                            const itemCount = order.items?.reduce((s, i) => s + (i.quantity ?? 1), 0) ?? 0;
                            const isCOD = pmtMethod === "Cash on Delivery";

                            const payBadge: Record<string, string> = {
                              pending:     "bg-amber-50 text-amber-600 border-amber-200",
                              pending_cod: "bg-blue-50 text-blue-700 border-blue-200",
                              confirmed:   "bg-green-50 text-green-600 border-green-200",
                              cancelled:   "bg-red-50 text-red-500 border-red-200",
                            };

                            return (
                              <Link key={order.id} href={`/account/orders/${order.id}`}
                                className="block p-5 bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-300 hover:bg-white hover:shadow-sm transition-all group"
                              >
                                {/* Top row */}
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center shrink-0">
                                      <Package size={16} className="text-white" />
                                    </div>
                                    <div>
                                      <p className="text-sm font-black text-gray-900">#{shortId}</p>
                                      <p className="text-[10px] text-gray-400 font-medium mt-0.5">
                                        {new Date(order.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                                        {" · "}{itemCount} item{itemCount !== 1 ? "s" : ""}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-base font-black text-gray-900">{currency}{total.toFixed(2)}</span>
                                    <ChevronRight size={14} className="text-gray-300 group-hover:text-black transition-colors" />
                                  </div>
                                </div>

                                {/* Charge breakdown (if delivery applies) */}
                                {delivery > 0 && (
                                  <div className="mt-3 flex items-center gap-4 text-[10px] text-gray-400 font-medium">
                                    <span>Subtotal: {currency}{subtotal.toFixed(2)}</span>
                                    <span className="text-gray-300">+</span>
                                    <span className="flex items-center gap-1"><Truck size={10} /> Delivery: {currency}{delivery.toFixed(2)}</span>
                                  </div>
                                )}

                                {/* Status badges */}
                                <div className="mt-3 flex items-center gap-2 flex-wrap">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold border ${statusCfg.bg}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                    {statusCfg.label}
                                  </span>
                                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold border ${payBadge[payStatus] ?? "bg-gray-50 text-gray-500 border-gray-100"}`}>
                                    {payStatus === "pending_cod" ? "💵 Cash on Delivery" : payStatus === "confirmed" ? "✓ Payment Confirmed" : payStatus === "pending" ? "⏳ Awaiting Payment" : "Cancelled"}
                                  </span>
                                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold bg-gray-100 text-gray-600 border border-gray-100">
                                    <CreditCard size={9} /> {pmtMethod}
                                  </span>
                                </div>

                                {/* COD Notice */}
                                {isCOD && (
                                  <div className="mt-3 flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
                                    <Truck size={12} className="text-blue-600 shrink-0" />
                                    <p className="text-blue-700 text-[10px] font-medium">Pay {currency}{total.toFixed(2)} when your order arrives at your door.</p>
                                  </div>
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
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
