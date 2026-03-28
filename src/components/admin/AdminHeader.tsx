"use client";

import React from "react";
import { Menu, X } from "lucide-react";
import { usePathname } from "next/navigation";
import NotificationBell from "./NotificationBell";

interface AdminHeaderProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/orders": "Orders",
  "/admin/products": "Products",
  "/admin/customers": "Customers",
  "/admin/media": "Media Library",
  "/admin/shop": "Shop Config",
  "/admin/settings": "Settings",
};

export default function AdminHeader({ isOpen, setIsOpen }: AdminHeaderProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname ?? ""] ?? "Admin Panel";

  return (
    <header className="flex items-center justify-between px-5 h-16 bg-white border-b border-gray-100 sticky top-0 z-[60] shadow-sm w-full">
      {/* Mobile branding */}
      <div className="flex items-center gap-2 md:hidden">
        <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">A</div>
        <span className="font-bold text-base tracking-tighter">Admin.</span>
      </div>

      {/* Desktop title */}
      <h2 className="hidden md:block font-bold text-xl tracking-tight text-gray-800">{title}</h2>

      <div className="flex items-center gap-2">
        <NotificationBell />
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 bg-gray-50 text-black rounded-xl border border-gray-100 active:scale-95 transition-all focus:outline-none"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  );
}
