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

export async function POST(request: NextRequest) {
  try {
    const adminToken = await verifyAdmin(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
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
export async function DELETE(request: NextRequest) {
  try {
    const adminToken = await verifyAdmin(request);
    if (!adminToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clearAll = searchParams.get("all");
    const recipient = searchParams.get("recipient") || "admin";

    if (clearAll === "true") {
      await storage.clearAllNotifications(recipient);
    } else if (id) {
      await storage.deleteNotification(id);
    } else {
      return NextResponse.json({ error: "Missing id or all=true param" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete notification(s):", error);
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
