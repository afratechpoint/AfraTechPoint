import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";

/**
 * POST /api/webhooks/steadfast
 * Public webhook endpoint for Steadfast Courier notifications.
 * Documented at: https://portal.packzy.com/api/v1/webhook_documentation
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Verify Authorization (Bearer Token)
    const authHeader = request.headers.get("authorization");
    const expectedToken = process.env.STEADFAST_API_KEY;

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      console.warn("[Steadfast Webhook] Unauthorized access attempt.");
      return NextResponse.json({ status: "error", message: "Unauthorized" }, { status: 401 });
    }

    const payload = await request.json();
    console.log("[Steadfast Webhook] Received payload:", JSON.stringify(payload, null, 2));

    const { notification_type, consignment_id, status, tracking_message } = payload;

    // 2. Find the order by consignment ID
    const order = await storage.getOrderByConsignmentId(consignment_id);

    if (!order) {
      console.warn(`[Steadfast Webhook] Order not found for consignment_id: ${consignment_id}`);
      return NextResponse.json({ status: "error", message: "Invalid consignment ID." }, { status: 200 }); // Return 200 per docs to stop retries if ID is invalid
    }

    // 3. Process based on notification type
    const updateData: any = {
      updatedAt: new Date().toISOString(),
      lastStatusSync: new Date().toISOString()
    };

    if (notification_type === "delivery_status") {
      updateData.courierStatus = status;

      // Map Steadfast status to internal orderStatus
      const lowerStatus = status.toLowerCase();
      if (lowerStatus === "delivered") {
        updateData.orderStatus = "delivered";
        updateData.status = "Delivered";
      } else if (lowerStatus === "cancelled") {
        updateData.orderStatus = "cancelled";
        updateData.status = "Cancelled";
      }
      // Note: "pending" and "partial_delivered" usually don't change the main orderStatus from "processing"/"shipped"
    }

    if (notification_type === "tracking_update" || tracking_message) {
      // You could store a history of tracking messages if your schema supported it.
      // For now, we update the latest courier status/message.
      if (tracking_message) {
        // We'll prepend the latest tracking message to the courier status for visibility
        console.log(`[Steadfast Webhook] Tracking update for order ${order.id}: ${tracking_message}`);
      }
    }

    // 4. Update the order in Firestore
    await storage.updateOrder(order.id, updateData);
    console.log(`[Steadfast Webhook] Successfully updated order ${order.id} to status: ${status}`);

    return NextResponse.json({
      status: "success",
      message: "Webhook received successfully."
    });

  } catch (error: any) {
    console.error("[Steadfast Webhook] Error processing webhook:", error.message);
    return NextResponse.json({ status: "error", message: "Internal server error" }, { status: 500 });
  }
}

// Support for checking if endpoint is alive
export async function GET() {
  return new Response("Steadfast Webhook Endpoint is Active.", { status: 200 });
}
