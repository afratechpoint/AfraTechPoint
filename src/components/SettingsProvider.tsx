"use client";

import React, { createContext, useContext } from "react";

import { THEMES, ThemeId } from "@/lib/themes";

export interface LinkItem {
  id: string;
  label: string;
  href: string;
}

export interface SocialLink {
  id: string;
  platform: string;
  url: string;
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
}

export interface CategoryItem {
  id: string;
  label: string;
  slug: string;
}

export { THEMES };
export type { ThemeId };

export interface Settings {
  storeName: string;
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  shortDescription: string;
  currencySymbol: string;
  themeId: ThemeId;
  announcementText: string;
  announcementActive: boolean;
  businessHours: string;
  signatureUrl?: string;
  signatureName?: string;
  navLinks: LinkItem[];
  socialLinks: SocialLink[];
  footerProducts: LinkItem[];
  footerCompany: LinkItem[];
  banners: BannerItem[];
  categories: CategoryItem[];
}

const SettingsContext = createContext<Settings | null>(null);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

export default function SettingsProvider({
  children,
  initialSettings,
}: {
  children: React.ReactNode;
  initialSettings: Settings;
}) {
  return (
    <SettingsContext.Provider value={initialSettings}>
      {children}
    </SettingsContext.Provider>
  );
}
