import { verifyAdmin } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

import { revalidatePath } from 'next/cache';

// ... (defaultSettings remain the same)

export async function GET() {
  // ...
}

export async function PUT(request: NextRequest) {
  try {
    const adminToken = await verifyAdmin(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

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
