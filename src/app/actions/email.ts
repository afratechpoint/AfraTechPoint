"use server";

import { sendEmail } from "@/lib/email/sendEmail";
import { storage } from "@/lib/storage";
import { 
  WelcomeEmail, 
  OrderConfirmation, 
  NewOrderAdminNotification, 
  OrderStatusUpdate, 
  PaymentConfirmed 
} from "@/emails/renderers/index";
import { verifyAdminAction } from "@/lib/auth-server";

export async function dispatchWelcomeEmail(email: string, name: string) {
  try {
    const settings = await storage.getSettings();
    const storeName = settings?.storeName || "Afra Tech Point";
    await sendEmail({
      to: email,
      subject: `Welcome to ${storeName}!`,
      template: WelcomeEmail,
      props: { 
        customerName: name,
        logoUrl: settings?.logoUrl,
        shopUrl: settings?.shopUrl
      }
    });
  } catch(e) { console.error("Failed to send WelcomeEmail:", e); }
}

export async function dispatchOrderEmails(email: string, orderId: string, customerName: string, items: any[], total: number, shippingAddress: any, orderDate: string) {
  try {
    const settings = await storage.getSettings();
    const adminEmail = settings?.adminEmail || process.env.ADMIN_EMAIL || process.env.SMTP_USER || "";
    const logoUrl = settings?.logoUrl;
    const shopUrl = settings?.shopUrl;
    
    const results = await Promise.allSettled([
      sendEmail({
        to: email,
        subject: `Your Order Confirmation #${orderId.slice(0, 8).toUpperCase()}`,
        template: OrderConfirmation,
        props: { customerName, orderId, items, total, deliveryCharge: settings?.deliveryCharge, shippingAddress, orderDate, logoUrl, shopUrl }
      }),
      sendEmail({
        to: adminEmail,
        subject: `[ACTION REQUIRED] New Order #${orderId.slice(0, 8).toUpperCase()}`,
        template: NewOrderAdminNotification,
        props: { customerName, orderId, items, total, deliveryCharge: settings?.deliveryCharge, shippingAddress, logoUrl, shopUrl }
      })
    ]);

    results.forEach((res, i) => {
      if (res.status === 'rejected') {
        console.error(`Server Action Order Email ${i} failed:`, res.reason);
      } else {
        console.log(`Server Action Order Email ${i} sent successfully.`);
      }
    });
  } catch(e) { 
    console.error("Failed to dispatch order emails:", e); 
  }
}

export async function dispatchOrderStatusUpdate(email: string, orderId: string, status: string, trackingInfo?: string) {
  const admin = await verifyAdminAction();
  if (!admin) return;

  try {
    const settings = await storage.getSettings();
    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
    await sendEmail({
      to: email,
      subject: `Order #${orderId.slice(0, 8).toUpperCase()} is now ${capitalizedStatus}`,
      template: OrderStatusUpdate,
      props: { 
        orderId, 
        status, 
        trackingInfo,
        logoUrl: settings?.logoUrl,
        shopUrl: settings?.shopUrl
      }
    });
  } catch(e) { console.error("Failed to send OrderStatusUpdate:", e); }
}

export async function dispatchPaymentConfirmed(email: string, orderId: string, customerName: string) {
  const admin = await verifyAdminAction();
  if (!admin) return;

  try {
    const settings = await storage.getSettings();
    await sendEmail({
      to: email,
      subject: `Payment Confirmed for Order #${orderId.slice(0, 8).toUpperCase()}`,
      template: PaymentConfirmed,
      props: { 
        orderId, 
        customerName,
        logoUrl: settings?.logoUrl,
        shopUrl: settings?.shopUrl
      }
    });
  } catch(e) { console.error("Failed to send PaymentConfirmed:", e); }
}
