import { verifyAdmin, verifyUser } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { sendEmail } from "@/lib/email/sendEmail";
import { OrderStatusUpdate, PaymentConfirmed } from "@/emails/renderers/index";


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminToken = await verifyAdmin(request);
  const userToken = !adminToken ? await verifyUser(request) : null;

  const { id }  = await params;
  const order = await storage.getOrderById(id);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

  // ── Authorization ──
  // Allow if admin or if the user is the owner.
  // Orders are stored with a `userId` field (Firebase UID). We also check
  // `order.uid` and `order.userEmail` for backwards-compatibility.
  const isOwner = userToken && (
    order.userId   === userToken.uid   ||
    order.uid      === userToken.uid   ||
    order.userEmail === userToken.email
  );

  if (!adminToken && !isOwner) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json(order);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminToken = await verifyAdmin(request);
  if (!adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id }  = await params;
    const oldOrder = await storage.getOrderById(id);
    if (!oldOrder) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const body = await request.json();
    await storage.updateOrder(id, body);
    const newOrder = await storage.getOrderById(id);
    if (!newOrder) return NextResponse.json({ error: 'Order update failed' }, { status: 500 });

    // ── Send Email Notifications ─────────────────────────────────────
    try {
      const settings = await storage.getSettings();
      const logoUrl = settings?.logoUrl;
      const shopUrl = settings?.shopUrl;
      const promises: Promise<any>[] = [];


      // 1. Order Status Update
      if (body.orderStatus && body.orderStatus !== oldOrder.orderStatus) {
        promises.push(sendEmail({
          to: newOrder.userEmail || newOrder.email,
          subject: `Order Update #${newOrder.id.slice(0, 8).toUpperCase()}`,
          template: OrderStatusUpdate,
          props: {
            orderId: newOrder.id,
            status: newOrder.orderStatus,
            trackingInfo: body.trackingNumber || newOrder.trackingNumber,
            logoUrl,
            shopUrl
          }
        }));
      }

      // 2. Payment Confirmation
      if (body.paymentStatus === 'confirmed' && oldOrder.paymentStatus !== 'confirmed') {
        promises.push(sendEmail({
          to: newOrder.userEmail || newOrder.email,
          subject: `Payment Confirmed: Order #${newOrder.id.slice(0, 8).toUpperCase()}`,
          template: PaymentConfirmed,
          props: {
            orderId: newOrder.id,
            customerName: newOrder.shippingAddress?.fullName || 'Valued Customer',
            logoUrl,
            shopUrl
          }
        }));
      }

      if (promises.length > 0) {
        const results = await Promise.allSettled(promises);
        results.forEach((res, i) => {
          if (res.status === 'rejected') {
            console.error(`Email ${i} failed:`, res.reason);
          } else {
            console.log(`Email ${i} sent successfully.`);
          }
        });
      }
    } catch (emailErr) {
      console.warn("Non-blocking status update email failure:", emailErr);
    }

    return NextResponse.json(newOrder);
  } catch (err: any) {
    console.error("Order update error:", err);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminToken = await verifyAdmin(request);
  if (!adminToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await storage.deleteOrder(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Order deletion error:", err);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
