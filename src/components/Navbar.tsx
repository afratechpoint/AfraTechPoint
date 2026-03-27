"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Search, ShoppingBag, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useSettings } from "@/components/SettingsProvider";
import { useAuth } from "@/contexts/AuthContext";

interface NavbarProps {
  searchEnabled?: boolean;
  searchQuery?: string;
  setSearchQuery?: (query: string) => void;
  onOpenCart: () => void;
}

export default function Navbar({ 
  searchEnabled = false, 
  searchQuery = "", 
  setSearchQuery, 
  onOpenCart 
}: NavbarProps) {
  const pathname  = usePathname();
  const router    = useRouter();
  const { items } = useCart();
  const settings  = useSettings();
  const { user, loading, isAdmin, logout, displayName, photoURL } = useAuth();

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const navLinks  = settings.navLinks || [];

  // ── User dropdown state ─────────────────────────────────────────
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await logout();
    router.push("/");
  };

  // Derived display values from Context
  const initials    = (displayName || user?.email || "A")[0].toUpperCase();
  const finalDisplayName = displayName || (user?.email?.split("@")[0] ?? "Account");

  return (
    <nav className="w-full border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-[100] transition-all pt-safe">
      {/* ── Mobile top bar ── */}
      <div className="flex md:hidden items-center justify-between h-14 px-4">
        <Link href="/" className="shrink-0">
          <img src={settings.logoUrl || "/logo.png"} alt={settings.storeName} className="h-7 w-auto object-contain" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-xl bg-gray-50 border border-gray-100 active:scale-95 transition-all"
          >
            <ShoppingBag size={18} className="text-gray-700" />
            {cartCount > 0 && (
              <span
                style={{ backgroundColor: "var(--primary)", color: "var(--primary-text)" }}
                className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full border-2 border-white text-[9px] font-bold"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile search bar */}
      {searchEnabled && (
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery?.(e.target.value)}
              className="w-full h-9 pl-9 pr-4 rounded-xl bg-gray-50 border border-gray-100 outline-none text-sm text-gray-900 placeholder:text-gray-400 font-medium focus:ring-2 focus:ring-black transition-all"
            />
          </div>
        </div>
      )}

      {/* ── Desktop full nav ── */}
      <div className="hidden md:flex w-full max-w-[1440px] mx-auto h-16 items-center justify-between px-4 md:px-8">

        {/* ── Left: Logo + Nav links ─────────────────────────────── */}
        <div className="flex items-center gap-6 md:gap-10 shrink-0">
          <Link href="/" className="shrink-0">
            <img src={settings.logoUrl || "/logo.png"} alt={settings.storeName} className="h-7 md:h-9 w-auto object-contain" />
          </Link>

          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.id || link.label}
                  href={link.href}
                  className={cn(
                    "text-[11px] font-black uppercase tracking-[0.15em] transition-all relative group",
                    isActive ? "text-black" : "text-gray-400 hover:text-black"
                  )}
                >
                  {link.label}
                  <span className={cn(
                    "absolute -bottom-2 left-0 h-[2px] bg-[var(--primary)] transition-all duration-300",
                    isActive ? "w-4" : "w-0 group-hover:w-full"
                  )} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Center: Search ─────────────────────────────────────── */}
        <div className="flex-1 max-w-sm px-6 hidden md:block">
          {searchEnabled && (
            <div className="relative group w-full">
              <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors pointer-events-none">
                <Search size={16} strokeWidth={2.5} />
              </div>
              <input
                type="text"
                placeholder="Search premium electronics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery?.(e.target.value)}
                className="w-full h-9 pl-10 pr-4 rounded-[10px] ring-1 ring-gray-100 focus:ring-2 focus:ring-black transition-all bg-gray-50/50 outline-none text-[11px] font-bold tracking-tight placeholder:text-gray-300 placeholder:font-medium"
              />
            </div>
          )}
        </div>

        {/* ── Right: Cart + Auth ─────────────────────────────────── */}
        <div className="flex items-center gap-4 shrink-0 justify-end">

          {/* Cart button */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={onOpenCart}
              className="p-2.5 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50 transition-all relative group"
            >
              <ShoppingBag size={20} className="text-gray-700 group-hover:text-black" />
              {cartCount > 0 && (
                <span
                  style={{ backgroundColor: "var(--primary)", color: "var(--primary-text)" }}
                  className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full border-2 border-white text-[10px] font-bold"
                >
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* ── Auth section ─────────────────────────────────────── */}
          <div className="hidden md:flex items-center pl-4 border-l border-gray-100 ml-2">

            {/* Loading skeleton */}
            {loading && (
              <div className="flex items-center gap-2 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-100" />
                <div className="w-20 h-3 rounded bg-gray-100 hidden xl:block" />
              </div>
            )}

            {/* ── LOGGED IN: Avatar + Name + Dropdown ── */}
            {!loading && user && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all group"
                >
                  {/* Avatar */}
                  {photoURL && !imgError ? (
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                      <Image 
                        src={photoURL} 
                        alt={finalDisplayName} 
                        width={32} 
                        height={32} 
                        className="object-cover" 
                        unoptimized 
                        onError={() => setImgError(true)}
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                      <span className="text-white text-xs font-black">{initials}</span>
                    </div>
                  )}

                  {/* Name (visible on xl+ screens) */}
                  <div className="hidden xl:block text-left">
                    <p className="text-[11px] font-black text-gray-900 tracking-tight leading-none truncate max-w-[100px]">
                      {finalDisplayName}
                    </p>
                    <p className="text-[9px] text-gray-400 font-medium mt-0.5 leading-none">My Account</p>
                  </div>

                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform hidden xl:block ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Dropdown menu */}
                {dropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden z-50">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                      <p className="text-[10px] font-black text-gray-900 truncate">{finalDisplayName}</p>
                      <p className="text-[9px] text-gray-400 font-medium truncate mt-0.5">{user.email}</p>
                    </div>

                    {/* Menu items */}
                    <Link
                      href="/account"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                    >
                      <User size={14} /> My Account
                    </Link>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-600 hover:bg-gray-50 hover:text-black transition-colors"
                      >
                        <Settings size={14} /> Admin Panel
                      </Link>
                    )}

                    <div className="border-t border-gray-50" />

                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── LOGGED OUT: Sign In + Register ── */}
            {!loading && !user && (
              <div className="flex items-center gap-5">
                <Link
                  href="/login"
                  className="text-[10px] font-black text-gray-400 hover:text-black uppercase tracking-[0.2em] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  style={{
                    backgroundColor: "var(--primary)",
                    color: "var(--primary-text)",
                    boxShadow: "0 10px 15px -3px var(--primary-accent)",
                  }}
                  className="h-9 px-4 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
