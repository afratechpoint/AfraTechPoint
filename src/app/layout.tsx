import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { storage } from "@/lib/storage";
import ClientLayout from "@/components/ClientLayout";
import SettingsProvider from "@/components/SettingsProvider";
import { THEMES, ThemeId } from "@/lib/themes";
import { AuthProvider } from "@/contexts/AuthContext";

const inter = Inter({ subsets: ["latin"] });

const defaultSettings = {
  storeName: "Afra Tech Point",
  logoUrl: "/logo.png",
  contactEmail: "info@afratechpoint.shop",
  contactPhone: "+880 1XXXXXXXXX",
  contactAddress: "Dhaka, Bangladesh",
  shortDescription: "Your premium destination for the latest in cutting-edge electronics and smart home devices.",
  currencySymbol: "৳",
  themeId: "midnight" as ThemeId,
  announcementText: "",
  announcementActive: false,
  navLinks: [],
  socialLinks: [],
  footerProducts: [],
  footerCompany: [],
  banners: [],
  categories: []
};

import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers();
  const host = headersList.get('host') || "";
  const isAdminSubdomain = host.startsWith('admin.');

  let settings: any = {};
  try {
    settings = await storage.getSettings();
    if (!settings || Object.keys(settings).length === 0 || Array.isArray(settings)) {
      settings = defaultSettings;
    }
  } catch (e) {
    settings = defaultSettings;
  }

  if (isAdminSubdomain) {
    return {
      title: "Admin Panel | " + settings.storeName,
      description: "Manage your Afra Tech Point store.",
      manifest: "/api/manifest/admin",
      icons: {
        icon: "/icons/admin-icon-192.png",
        shortcut: "/icons/admin-icon-192.png",
        apple: "/icons/admin-icon-192.png",
      },
      appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "ATP Admin",
      },
    };
  }

  return {
    title: settings.storeName,
    description: settings.shortDescription,
    manifest: "/api/manifest/shop",
    icons: {
      icon: settings.logoUrl || "/logo.png",
      shortcut: settings.logoUrl || "/logo.png",
      apple: settings.logoUrl || "/logo.png",
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: settings.storeName,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let settings: any = {};
  try {
    settings = await storage.getSettings();
    if (!settings || Object.keys(settings).length === 0 || Array.isArray(settings)) {
      settings = defaultSettings;
    }
  } catch (e) {
    settings = defaultSettings;
  }

  const themeId = (settings.themeId as ThemeId) || "midnight";
  const theme = THEMES[themeId] || THEMES.midnight;

  return (
    <html lang="en" className="bg-[#f9fafb] overscroll-y-none" suppressHydrationWarning>
      <head>
        <meta name="application-name" content="Afra Tech Point" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Afra Tech" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="theme-color" content="#111111" />
        <link rel="apple-touch-icon" href="/icons/shop-icon-192.png" />
        <style
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --primary: ${theme.primary};
                --primary-hover: ${theme.hover};
                --primary-text: ${theme.text};
                --primary-accent: ${theme.accent};
              }
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-[100dvh] bg-[#f9fafb] overscroll-y-none overflow-x-hidden`} suppressHydrationWarning>
        <AuthProvider>
          <SettingsProvider initialSettings={settings}>
            {settings.announcementActive && settings.announcementText && (
              <div 
                className="w-full text-center py-2 px-4 shadow-sm text-xs font-bold z-[110] relative transition-colors duration-500"
                style={{ 
                  backgroundColor: 'var(--primary)',
                  color: 'var(--primary-text)' 
                }}
              >
                {settings.announcementText}
              </div>
            )}
            <ClientLayout>
              {children}
            </ClientLayout>
          </SettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
