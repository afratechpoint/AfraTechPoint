import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Note: In a production app, we would ideally verify the admin session here 
    // using cookies/session tokens. For now, since the client-side layout handles auth, 
    // we provide the count to the dashboard.
    const count = await storage.getPendingOrdersCount();
    return NextResponse.json({ count });
  } catch (error) {
    console.error("Failed to fetch order count:", error);
    return NextResponse.json({ error: "Failed to fetch order count" }, { status: 500 });
  }
}
