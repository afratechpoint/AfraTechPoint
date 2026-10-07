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
  "/admin/notifications": "Notifications",
  "/admin/media": "Media Library",
  "/admin/shop": "Shop Config",
  "/admin/settings": "Settings",
};

export default function AdminHeader({ isOpen, setIsOpen }: AdminHeaderProps) {
  const pathname = usePathname();
  const title = pageTitles[pathname ?? ""] ?? "Admin Panel";

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 h-16 bg-white border-b border-gray-100 sticky top-0 z-[60] shadow-sm w-full">
      {/* Mobile & Tablet Toggle + Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="lg:hidden p-2 bg-gray-50 text-black rounded-xl border border-gray-100 hover:bg-gray-100 active:scale-95 transition-all focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-7 h-7 bg-black rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">A</div>
          <span className="font-bold text-base tracking-tighter">Admin.</span>
        </div>

        {/* Desktop Title */}
        <h2 className="hidden lg:block font-bold text-xl tracking-tight text-gray-800">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Active Page Indicator on smaller screens */}
        <span className="text-xs font-semibold text-gray-400 hidden sm:inline-block mr-1 lg:hidden">
          {title}
        </span>
        <NotificationBell />
      </div>
    </header>
  );
}
