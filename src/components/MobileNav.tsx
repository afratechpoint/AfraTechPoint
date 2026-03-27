"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Home, ShoppingBag, ShoppingCart, User, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/contexts/AuthContext";

const navItems = [
  { label: "Home",   icon: Home,        href: "/" },
  { label: "Shop",   icon: ShoppingBag, href: "/shop" },
  { label: "Cart",   icon: ShoppingCart,href: "/cart" },
  { label: "Account",icon: User,        href: "/account" },
  { label: "About",   icon: Info,        href: "/about" },
];

export default function MobileNav() {
  const pathname  = usePathname();
  const { items } = useCart();
  const { user }  = useAuth();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  // Build items, updating the Account href based on auth state
  const resolvedItems = navItems.map(item =>
    item.label === "Account"
      ? { ...item, href: user ? "/account" : "/login" }
      : item
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[500] md:hidden">
      {/* Docked Bar */}
      <div className="relative border-t border-gray-100 bg-white/80 backdrop-blur-3xl shadow-[0_-4px_20px_rgba(0,0,0,0.05)] pb-safe">
        <div className="flex items-center justify-around h-[62px] px-2 max-w-md mx-auto">
          {resolvedItems.map((item) => {
            const isActive = pathname === item.href && item.href !== "#";
            const Icon = item.icon;



            return (
              <Link
                key={item.label}
                href={item.href}
                className="relative flex flex-col items-center gap-0.5 w-12 tap-target"
                style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "44px" }}
              >
                <div
                  className={cn(
                    "relative p-2 rounded-2xl transition-all duration-300",
                    isActive ? "text-black" : "text-gray-400"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobile-nav-pill"
                      className="absolute inset-0 bg-black/8 rounded-2xl"
                      transition={{ type: "spring", bounce: 0.25, duration: 0.5 }}
                    />
                  )}
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label === "Cart" && cartCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-black text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white px-0.5">
                      {cartCount > 9 ? "9+" : cartCount}
                    </span>
                  )}
                </div>
                <span
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-wide -mt-0.5 transition-colors",
                    isActive ? "text-black" : "text-gray-400"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
