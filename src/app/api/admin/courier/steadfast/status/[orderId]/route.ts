import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-server";
import { storage } from "@/lib/storage";
import { steadfast } from "@/lib/courier/steadfast";

/**
 * GET /api/admin/courier/steadfast/status/[orderId]
 * Fetches the latest courier status from Steadfast and updates the order in Firestore.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const decodedToken = await verifyAdmin(request);
  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { orderId } = await params;
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // 1. Fetch order to get consignment ID
    const order = await storage.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const consignmentId = order.courierConsignmentId || order.courierTrackingCode;
    if (!consignmentId) {
      return NextResponse.json({ error: "This order has not been shipped via courier yet" }, { status: 400 });
    }

    // 2. Fetch status from Steadfast
    const result = await steadfast.getStatusById(consignmentId);

    if (result.status === 200 && result.delivery_status) {
      // 3. Map Steadfast status to our internal courierStatus
      const newStatus = result.delivery_status;
      
      // Update order in storage
      const updateData: any = {
        courierStatus: newStatus,
        lastStatusSync: new Date().toISOString()
      };

      // Optional: Automatically update internal orderStatus if delivered
      if (newStatus.toLowerCase() === 'delivered') {
        updateData.orderStatus = 'delivered';
        updateData.status = 'Delivered';
      }

      await storage.updateOrder(orderId, updateData);

      return NextResponse.json({
        success: true,
        status: newStatus,
        rawResponse: result
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message || "Could not fetch status from Steadfast"
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("[Steadfast Status API] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
