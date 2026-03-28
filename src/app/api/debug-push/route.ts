import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const uid = searchParams.get("uid") || "admin";
    
    console.log(`[Debug] Triggering manual push for UID: ${uid}`);
    
    const adapter = await import("@/lib/firebase/server_firestore");
    const result = await adapter.sendPushToUser(uid, "Test Push", "This is a test notification from ATP.", "/admin/orders");
    
    return NextResponse.json({ success: true, message: `Push triggered for ${uid}`, result });
  } catch (error: any) {
    console.error("[Debug] Manual push failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
