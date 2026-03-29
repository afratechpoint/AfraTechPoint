export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

import { revalidatePath } from 'next/cache';

const defaultSettings = {
  // ... (keeping existing defaultSettings)
  storeName: "Afra Tech Point",
  logoUrl: "/logo.png",
  contactEmail: "info@afratechpoint.shop",
  contactPhone: "+880 1XXXXXXXXX",
  contactAddress: "Dhaka, Bangladesh",
  shortDescription: "Your premium destination for the latest in cutting-edge electronics and smart home devices.",
  currencySymbol: "৳",
  themeId: "midnight",
  announcementText: "Welcome to Afra Tech Point! Free shipping on orders over ৳5000! Shop now.",
  announcementActive: false,
  businessHours: "Mon - Fri: 9:00 AM - 6:00 PM",
  navLinks: [
    { id: "1", label: "Home", href: "/" }
  ],
  banners: [],
  categories: [],
  socialLinks: [],
  footerProducts: [],
  footerCompany: []
};

export async function GET() {
  let settings = await storage.getSettings();
  
  // If settings empty or invalid
  if (!settings || Object.keys(settings).length === 0 || Array.isArray(settings)) {
    settings = defaultSettings;
    await storage.updateSettings(settings); // Seed
  }
  
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    const settings = await storage.getSettings();
    
    const updatedSettings = { ...settings, ...data };
    await storage.updateSettings(updatedSettings);
    
    // Recalculate home page and contact page
    revalidatePath("/");
    revalidatePath("/contact");
    
    return NextResponse.json(updatedSettings);
  } catch (error: any) {
    console.error("Firebase settings save error:", error);
    return NextResponse.json({ error: error.message || "Failed to save settings" }, { status: 500 });
  }
}
