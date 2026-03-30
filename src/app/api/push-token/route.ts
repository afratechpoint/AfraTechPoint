import { verifyUser, verifyAdmin } from "@/lib/auth-server";
import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function POST(request: NextRequest) {
  try {
    const { uid, token } = await request.json();
    if (!uid || !token) {
      return NextResponse.json({ error: "Missing uid or token" }, { status: 400 });
    }

    // ── Protection ──
    const adminToken = await verifyAdmin(request);
    const userToken = !adminToken ? await verifyUser(request) : null;

    if (!adminToken && (!userToken || userToken.uid !== uid)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await storage.savePushToken(uid, token);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save push token:", error);
    return NextResponse.json({ error: "Failed to save push token" }, { status: 500 });
  }
}
