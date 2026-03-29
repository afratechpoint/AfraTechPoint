import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export const dynamic = 'force-dynamic';
import { sendEmail } from "@/lib/email/sendEmail";
import { OrderConfirmation, NewOrderAdminNotification } from "@/emails/renderers/index";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId        = searchParams.get('userId');
  const paymentStatus = searchParams.get('paymentStatus');
  const orderStatus   = searchParams.get('orderStatus');
  const all           = searchParams.get('all');

  // getOrders handles both filtering and all
  const orders = await storage.getOrders({ userId: userId && !all ? userId : undefined });

  let result = orders;

  // Additional server-side filters if needed (legacy or specific props)
  if (paymentStatus) {
    result = result.filter((o: any) => o.paymentStatus === paymentStatus);
  }
  if (orderStatus) {
    result = result.filter((o: any) => o.orderStatus === orderStatus);
  }

  // Sort newest first
  result = result.sort((a: any, b: any) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return NextResponse.json(result);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // storage.createOrder handles ID generation and persistence
    const newOrder = await storage.createOrder({
      ...body,
      paymentStatus: body.paymentStatus ?? 'pending',
      orderStatus:   body.orderStatus   ?? 'processing',
      status:        body.status        ?? 'Processing',
    });

    // ── Send Email Notifications ─────────────────────────────────────
    // We use Promise.allSettled to ensure that even if emails fail 
    // (e.g., missing SMTP config or network issues), the order creation proceeds.
    try {
      const settings = await storage.getSettings();
      const adminEmail = settings?.adminEmail || process.env.ADMIN_EMAIL || process.env.SMTP_USER || "info@afratechpoint.shop";
      const customerEmail = body.userEmail || body.email || body.customer?.email;
      
      const logoUrl = settings?.logoUrl;
      const shopUrl = settings?.shopUrl;

      if (customerEmail) {
        const results = await Promise.allSettled([
          // 1. Sent to Customer
          sendEmail({
            to: customerEmail,
            subject: `Order Confirmation #${newOrder.id.slice(0, 8).toUpperCase()}`,
            template: OrderConfirmation,
            props: {
              customerName: body.shippingAddress?.fullName || body.customer?.name || 'Customer',
              orderId: newOrder.id,
              items: body.items,
              total: body.totalAmount || body.total,
              shippingAddress: body.shippingAddress,
              orderDate: newOrder.createdAt,
              logoUrl,
              shopUrl
            }
          }),
          // 2. Sent to Administrator
          sendEmail({
            to: adminEmail,
            subject: `🚨 New Order Received: #${newOrder.id.slice(0, 8).toUpperCase()}`,
            template: NewOrderAdminNotification,
            props: {
              orderId: newOrder.id,
              customerName: body.shippingAddress?.fullName || body.customer?.name || 'Customer',
              customerEmail: customerEmail,
              total: body.totalAmount || body.total,
              items: body.items,
              shippingAddress: body.shippingAddress,
              logoUrl,
              shopUrl
            }
          })
        ]);

        results.forEach((res, i) => {
          if (res.status === 'rejected') {
            console.error(`Order Email ${i} failed:`, res.reason);
          } else {
            console.log(`Order Email ${i} sent successfully.`);
          }
        });
      } else {
        console.warn("No customer email found in order payload. Skipping customer notification.");
      }
    } catch (emailErr) {
      console.warn("Non-blocking email notification failure:", emailErr);
    }

    return NextResponse.json(newOrder, { status: 201 });
  } catch (err: any) {
    console.error("Order creation error:", err);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
