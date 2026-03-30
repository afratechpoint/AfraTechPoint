import { verifyAdmin, verifyUser } from '@/lib/auth-server';
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export const dynamic = 'force-dynamic';
import { sendEmail } from "@/lib/email/sendEmail";
import { OrderConfirmation, NewOrderAdminNotification } from "@/emails/renderers/index";

// ── Order Creation Rate Limiter (per-IP) ─────────────────────────────
// Max 10 order attempts per 10 minutes — prevents bot flooding
const ORDER_RATE_WINDOW = 10 * 60 * 1000;
const ORDER_RATE_MAX    = 10;
const orderRateMap      = new Map<string, { count: number; firstAt: number }>();

function checkOrderRateLimit(ip: string) {
  const now  = Date.now();
  const data = orderRateMap.get(ip);
  if (!data || now - data.firstAt > ORDER_RATE_WINDOW) {
    orderRateMap.set(ip, { count: 1, firstAt: now });
    return true;
  }
  if (data.count >= ORDER_RATE_MAX) return false;
  data.count++;
  return true;
}
// ─────────────────────────────────────────────────────────────────────


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId        = searchParams.get('userId');
  const all           = searchParams.get('all');

  // ── Protection ──
  // If requesting 'all' or no userId, must be admin.
  // If requesting specific userId, must be that user or an admin.
  const adminToken = await verifyAdmin(request);
  const userToken = !adminToken ? await verifyUser(request) : null;

  if (all || !userId) {
    if (!adminToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } else if (userId) {
    if (!adminToken && (!userToken || userToken.uid !== userId)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // getOrders handles both filtering and all
  const orders = await storage.getOrders({ userId: userId && !all ? userId : undefined });

  let result = orders;
  const paymentStatus = searchParams.get('paymentStatus');
  const orderStatus   = searchParams.get('orderStatus');

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

export async function POST(request: NextRequest) {
  try {
    // ── Rate Limit ────────────────────────────────────────────────────
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    if (!checkOrderRateLimit(ip)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
    // ────────────────────────────────────────────────────────────────

    // ── Require authenticated user to place an order ──────────────────
    const userToken = await verifyUser(request);
    if (!userToken) {
      return NextResponse.json({ error: "You must be logged in to place an order." }, { status: 401 });
    }
    // ────────────────────────────────────────────────────────────────

    const body = await request.json();
    const { items, shippingAddress, payment, userId } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Invalid items" }, { status: 400 });
    }

    // ── Server-Side Price Calculation (SECURITY FIX) ──
    const allProducts = await storage.getProducts();
    const settings = await storage.getSettings();
    const deliveryCharge = Number(settings?.deliveryCharge) || 0;

    let calculatedSubtotal = 0;
    const validatedItems = items.map((item: any) => {
      const product = allProducts.find((p: any) => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      let price = product.salePrice || product.regularPrice || product.price || 0;
      
      // If variant is selected, check variant price
      if (item.variantName && product.variants) {
        const variant = product.variants.find((v: any) => v.name === item.variantName);
        if (variant) {
          price = variant.salePrice ?? variant.regularPrice ?? price;
        }
      }

      const quantity = Math.max(1, Number(item.quantity) || 1);
      calculatedSubtotal += price * quantity;

      return {
        productId: item.productId,
        name: product.name,
        price: price, // Use server price
        quantity: quantity,
        image: product.image,
        variantName: item.variantName || null,
      };
    });

    const calculatedTotal = calculatedSubtotal + deliveryCharge;

    // storage.createOrder handles ID generation and persistence
    const newOrder = await storage.createOrder({
      userId: userId || "guest",
      items: validatedItems,
      shippingAddress,
      payment: payment || { method: "Cash on Delivery" },
      subtotal: calculatedSubtotal,
      deliveryCharge: deliveryCharge,
      total: calculatedTotal,
      totalAmount: calculatedTotal,
      paymentStatus: body.paymentStatus ?? 'pending',
      orderStatus:   body.orderStatus   ?? 'processing',
      status:        body.status        ?? 'Processing',
      createdAt: new Date().toISOString(),
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
              customerName: shippingAddress?.fullName || body.customer?.name || 'Customer',
              orderId: newOrder.id,
              items: validatedItems,
              total: calculatedTotal,
              deliveryCharge: deliveryCharge,
              shippingAddress: shippingAddress,
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
              customerName: shippingAddress?.fullName || body.customer?.name || 'Customer',
              customerEmail: customerEmail,
              total: calculatedTotal,
              items: validatedItems,
              deliveryCharge: deliveryCharge,
              shippingAddress: shippingAddress,
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
