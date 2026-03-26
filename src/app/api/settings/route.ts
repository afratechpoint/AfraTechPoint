import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { revalidatePath } from 'next/cache';

const defaultSettings = {
  // ... (keeping existing defaultSettings)
  storeName: "Afra Tech Point",
  logoUrl: "/logo.png",
  contactEmail: "info@afratechpoint.com",
  contactPhone: "+1 (555) 123-4567",
  contactAddress: "123 Tech Avenue, Innovation District, Silicon Valley, CA 94025",
  shortDescription: "Your premium destination for the latest in cutting-edge electronics and smart home devices.",
  currencySymbol: "৳",
  themeId: "midnight",
  announcementText: "Welcome to Afra Tech Point! Free shipping on orders over ৳5000! Shop now.",
  announcementActive: false,
  businessHours: "Mon - Fri: 9:00 AM - 6:00 PM",
  navLinks: [
    { id: "1", label: "Home", href: "/" },
    { id: "2", label: "Shop", href: "/shop" },
    { id: "3", label: "About", href: "/about" },
    { id: "4", label: "Contact", href: "/contact" }
  ],
  banners: [
    { id: "b1", title: "Latest Gadgets", subtitle: "Discover the Future", imageUrl: "/banner1.jpg", linkUrl: "/shop" }
  ],
  categories: [
    { id: "c1", label: "Smartphones", slug: "smartphones" },
    { id: "c2", label: "Laptops", slug: "laptops" },
    { id: "c3", label: "Audio", slug: "audio" }
  ],
  socialLinks: [
    { id: "s1", platform: "Facebook", url: "https://facebook.com" },
    { id: "s2", platform: "Twitter", url: "https://twitter.com" },
    { id: "s3", platform: "Instagram", url: "https://instagram.com" }
  ],
  footerProducts: [
    { id: "p1", label: "Features", href: "#" },
    { id: "p2", label: "Pricing", href: "#" },
    { id: "p3", label: "Integrations", href: "#" },
    { id: "p4", label: "Changelog", href: "#" }
  ],
  footerCompany: [
    { id: "c1", label: "About", href: "/about" },
    { id: "c2", label: "Careers", href: "#" },
    { id: "c3", label: "Contact", href: "/contact" },
    { id: "c4", label: "Partners", href: "#" }
  ]
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
