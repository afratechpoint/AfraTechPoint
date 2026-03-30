import { verifyAdmin } from "@/lib/auth-server";
import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const adminToken = await verifyAdmin(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const count = await storage.getPendingOrdersCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Failed to fetch order count:", error);
    return NextResponse.json({ error: "Failed to fetch order count" }, { status: 500 });
  }
}
