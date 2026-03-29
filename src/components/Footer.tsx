"use client";

import Link from "next/link";
import { Link as LinkIcon, Truck, ShieldCheck, Headphones } from "lucide-react";
import Image from "next/image";
import { useSettings } from "@/components/SettingsProvider";

const getIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes('facebook')) return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
  );
  if (p.includes('instagram')) return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
  );
  if (p.includes('twitter') || p.includes('x')) return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>
  );
  if (p.includes('whatsapp')) return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.301-.149-1.767-.872-2.04-.971-.272-.099-.47-.149-.667.149-.198.298-.767.971-.94 1.169-.173.197-.347.223-.648.074a9.176 9.176 0 0 1-2.404-1.484 9.49 9.49 0 0 1-1.663-2.071c-.173-.298-.018-.46.13-.608.134-.132.301-.35.452-.524.15-.174.2-.298.3-.497.099-.198.05-.371-.025-.521-.075-.149-.667-1.61-.913-2.204-.24-.576-.484-.499-.667-.509-.17-.009-.364-.01-.559-.01-.196 0-.515.074-.784.371-.269.298-1.026 1.002-1.026 2.446 0 1.444 1.05 2.841 1.198 3.039.149.198 2.067 3.156 5.007 4.43.699.303 1.246.484 1.671.62.702.223 1.341.192 1.847.116.564-.085 1.767-.721 2.016-1.416.249-.694.249-1.289.174-1.417-.074-.127-.272-.2-.573-.349zM12.004 0C5.378 0 .004 5.374.004 12c0 2.112.544 4.17 1.583 5.968l-1.587 5.797 5.918-1.55c1.713.931 3.633 1.42 5.59 1.425a11.986 11.986 0 0 0 11.988-12c.002-6.626-5.372-12-12-12h-.002zM12.004 21.986c-1.898 0-3.76-.51-5.391-1.472l-.387-.23-3.52.923.94-3.433-.252-.4c-1.058-1.685-1.616-3.64-1.614-5.641.002-5.748 4.676-10.422 10.426-10.422 2.784.001 5.4 1.085 7.368 3.056a10.354 10.354 0 0 1 3.05 7.366c-.002 5.753-4.678 10.422-10.426 10.422z"/></svg>
  );
  if (p.includes('youtube')) return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
  );
  if (p.includes('telegram')) return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.25.24-.51.24l.21-2.97 5.41-4.89c.23-.21-.05-.32-.36-.12l-6.68 4.21-2.88-.9c-.62-.2-.63-.64.13-.94l11.23-4.32c.53-.18 1.02.13.88.82z"/></svg>
  );
  return <LinkIcon size={14} />;
};

const TRUST_BADGES = [
  { icon: Truck,        label: "Fast Delivery",   sub: "Dhaka & nationwide" },
  { icon: ShieldCheck,  label: "100% Secure",      sub: "SSL encrypted checkout" },
  { icon: Headphones,   label: "24/7 Support",     sub: "Always here to help" },
];

export default function Footer() {
  const settings = useSettings();

  return (
    <footer className="w-full bg-gray-50 border-t border-gray-100 mt-20 pb-24 md:pb-0">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">

        {/* ── Trust bar ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 py-10 border-b border-gray-100">
          {TRUST_BADGES.map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center shrink-0">
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 py-12 border-b border-gray-100">

          {/* Brand */}
          <div className="md:col-span-5 space-y-5">
            <Link href="/" className="relative block h-14 w-40">
              <Image
                src={settings.logoUrl || "/logo.png"}
                alt={settings.storeName}
                fill
                sizes="160px"
                className="object-contain"
              />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
              {settings.shortDescription || "Your destination for premium technology products."}
            </p>
            {/* Social icons */}
            <div className="flex gap-2.5">
              {(settings.socialLinks || []).map((social) => (
                <Link
                  key={social.id}
                  href={social.url}
                  target="_blank"
                  title={social.platform}
                  className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-black hover:text-white hover:border-black transition-all"
                >
                  {getIcon(social.platform)}
                </Link>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="md:col-span-7 grid grid-cols-2 gap-10">
            <div>
              <h4 className="text-gray-900 text-xs font-black uppercase tracking-[0.2em] mb-5">Categories</h4>
              <ul className="space-y-3">
                {(settings.footerProducts || []).map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} className="text-gray-500 hover:text-black text-sm font-medium transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-gray-900 text-xs font-black uppercase tracking-[0.2em] mb-5">Company</h4>
              <ul className="space-y-3">
                {(settings.footerCompany || []).map((link) => (
                  <li key={link.id}>
                    <Link href={link.href} className="text-gray-500 hover:text-black text-sm font-medium transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────────── */}
        <div className="py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookies"].map((item) => (
              <Link key={item} href="#" className="text-gray-400 hover:text-black text-xs transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
