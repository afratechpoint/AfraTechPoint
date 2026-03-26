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
  contactEmail: "info@afratechpoint.com",
  contactPhone: "+1 (555) 123-4567",
  contactAddress: "123 Tech Avenue, Innovation District, Silicon Valley, CA 94025",
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

export async function generateMetadata(): Promise<Metadata> {
  let settings: any = {};
  try {
    settings = await storage.getSettings();
    if (!settings || Object.keys(settings).length === 0 || Array.isArray(settings)) {
      settings = defaultSettings;
    }
  } catch (e) {
    settings = defaultSettings;
  }

  return {
    title: settings.storeName,
    description: settings.shortDescription,
    icons: {
      icon: settings.logoUrl || "/logo.png",
      shortcut: settings.logoUrl || "/logo.png",
      apple: settings.logoUrl || "/logo.png",
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
    <html lang="en" suppressHydrationWarning>
      <head>
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
      <body className={`${inter.className} min-h-screen bg-[#f8f9fa] overflow-x-hidden pb-20 md:pb-0`} suppressHydrationWarning>
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
