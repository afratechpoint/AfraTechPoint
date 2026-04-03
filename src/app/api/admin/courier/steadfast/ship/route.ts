import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-server";
import { storage } from "@/lib/storage";
import { steadfast } from "@/lib/courier/steadfast";

/**
 * POST /api/admin/courier/steadfast/ship
 * Authenticated Admin Route to ship an order via Steadfast Courier.
 */
export async function POST(request: NextRequest) {
  const decodedToken = await verifyAdmin(request);
  if (!decodedToken) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  try {
    const { orderId, deliveryType } = await request.json();
    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    // 1. Fetch order from storage
    const order = await storage.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. Prepare Steadfast parcel data
    // Map order fields to Steadfast API parameters
    const addr = order.shippingAddress || order.customer || {};
    const recipientName = addr.fullName || addr.name || "Customer";
    const recipientPhone = addr.phone || "";
    const recipientAddress = [addr.address, addr.city, addr.postalCode].filter(Boolean).join(", ");
    
    // COD Logic:
    // If it's already confirmed (prepaid), COD is 0.
    // If it's pending_cod or pending, COD is the total amount.
    const isPrepaid = order.paymentStatus === "confirmed";
    const totalAmount = order.totalAmount ?? order.total ?? 0;
    const codAmount = isPrepaid ? 0 : Math.round(totalAmount);

    const steadfastData = {
      invoice: order.id,
      recipient_name: recipientName.substring(0, 100),
      recipient_phone: recipientPhone.replace(/\D/g, '').slice(-11), // Must be 11 digits
      recipient_address: recipientAddress.substring(0, 250),
      cod_amount: codAmount,
      note: `Order #${order.id.slice(0, 8)}`,
      item_description: order.items?.map((i: any) => i.name).join(", ").substring(0, 250) || "Electronics",
      delivery_type: deliveryType ?? 0, // Default to home delivery
    };

    // 3. Create parcel in Steadfast
    const result = await steadfast.createOrder(steadfastData);

    if (result.status === 200 && result.consignment) {
      // 4. Update order with tracking info
      const updateData = {
        courier: "Steadfast",
        courierTrackingCode: result.consignment.tracking_code,
        courierConsignmentId: result.consignment.consignment_id,
        courierStatus: result.consignment.status,
        orderStatus: "shipped", // Automatically mark as shipped
        status: "Shipped",
        shippedAt: new Date().toISOString()
      };

      await storage.updateOrder(orderId, updateData);

      return NextResponse.json({
        success: true,
        message: result.message,
        trackingCode: result.consignment.tracking_code
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.message || "Failed to create parcel in Steadfast"
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("[Steadfast API Route] Error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
