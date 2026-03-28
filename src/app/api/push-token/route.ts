import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function POST(request: Request) {
  try {
    const { uid, token } = await request.json();
    if (!uid || !token) {
      return NextResponse.json({ error: "Missing uid or token" }, { status: 400 });
    }

    await storage.savePushToken(uid, token);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save push token:", error);
    return NextResponse.json({ error: "Failed to save push token" }, { status: 500 });
  }
}
