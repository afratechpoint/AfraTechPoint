import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id }  = await params;
  const order = await storage.getOrderById(id);
  if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
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
      const { sendEmail } = await import("@/lib/email/sendEmail");
      const { OrderStatusUpdate, PaymentConfirmed } = await import("@/emails/renderers/index");

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
            trackingInfo: body.trackingNumber || newOrder.trackingNumber
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
            customerName: newOrder.shippingAddress?.fullName || 'Valued Customer'
          }
        }));
      }

      if (promises.length > 0) {
        Promise.allSettled(promises).then(results => {
          results.forEach((res, i) => {
            if (res.status === 'rejected') console.warn(`Email ${i} failed:`, res.reason);
          });
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
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await storage.deleteOrder(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Order deletion error:", err);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
}
