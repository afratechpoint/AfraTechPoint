import { verifyAdmin } from "@/lib/auth-server";
import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export async function GET(request: NextRequest) {
  try {
    const adminToken = await verifyAdmin(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await storage.getCustomersCount();
    return NextResponse.json({ count });
  } catch (error: any) {
    console.error("[API Customer Count Error]:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
