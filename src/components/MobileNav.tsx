"use strict";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, ShoppingBag, ShoppingCart, User, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCart } from "@/lib/cart";

const navItems = [
  { label: "Home", icon: Home, href: "/" },
  { label: "Shop", icon: ShoppingBag, href: "/shop" },
  { label: "Search", icon: Search, href: "/shop" }, // Can trigger search focus in future
  { label: "Cart", icon: ShoppingCart, href: "#", isCart: true },
  { label: "Profile", icon: User, href: "/login" },
];

interface MobileNavProps {
  onOpenCart: () => void;
}

export default function MobileNav({ onOpenCart }: MobileNavProps) {
  const pathname = usePathname();
  const { items } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[500] md:hidden">
      {/* Blur Background */}
      <div className="absolute inset-x-4 bottom-4 h-20 bg-white/70 backdrop-blur-3xl border border-white/40 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)]" />
      
      <div className="relative flex items-center justify-around h-20 px-6 pb-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          if (item.isCart) {
            return (
              <button
                key={item.label}
                onClick={onOpenCart}
                className="relative flex flex-col items-center gap-1 group"
              >
                <div className={cn(
                  "p-2 rounded-2xl transition-all duration-300",
                  "text-gray-400 group-hover:bg-gray-50"
                )}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  {cartCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-black text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-in zoom-in duration-300">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="relative flex flex-col items-center gap-1 group"
            >
              <div className={cn(
                "p-2 rounded-2xl transition-all duration-300",
                isActive ? "text-black bg-black/5" : "text-gray-400 group-hover:bg-gray-50"
              )}>
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                {isActive && (
                   <motion.div 
                     layoutId="mobile-nav-active"
                     className="absolute inset-0 bg-black/5 rounded-2xl -z-10"
                     transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                   />
                )}
              </div>
              <span className={cn(
                "text-[9px] font-bold uppercase tracking-widest transition-colors",
                isActive ? "text-black" : "text-gray-400"
              )}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
      
      {/* Home Indicator Space (iOS style) */}
      <div className="h-4 bg-white/80 backdrop-blur-2xl" />
    </div>
  );
}
