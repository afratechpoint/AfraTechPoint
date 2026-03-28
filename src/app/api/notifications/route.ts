import { NextResponse } from "next/server";
import { storage } from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const recipient = searchParams.get("recipient") || "admin";
    const limit = parseInt(searchParams.get("limit") || "20");

    const notifications = await storage.getNotifications(recipient, limit);
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, all, recipient } = body;

    if (all) {
      await storage.markAllNotificationsAsRead(recipient || "admin");
    } else if (id) {
      await storage.markNotificationAsRead(id);
    } else {
      return NextResponse.json({ error: "Missing notification ID or 'all' flag" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update notification:", error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}
