"use server";

import { sendEmail } from "@/lib/email/sendEmail";
import { 
  WelcomeEmail, 
  OrderConfirmation, 
  NewOrderAdminNotification, 
  OrderStatusUpdate, 
  PaymentConfirmed 
} from "@/emails/renderers/index";

export async function dispatchWelcomeEmail(email: string, name: string) {
  try {
    await sendEmail({
      to: email,
      subject: "Welcome to Nitec Ecosystem!",
      template: WelcomeEmail,
      props: { customerName: name }
    });
  } catch(e) { console.error("Failed to send WelcomeEmail:", e); }
}

export async function dispatchOrderEmails(email: string, orderId: string, customerName: string, items: any[], total: number, shippingAddress: any, orderDate: string) {
  try {
    // Blast concurrent emails to Customer and Admin
    await Promise.all([
      sendEmail({
        to: email,
        subject: `Your Order Confirmation #${orderId.slice(0, 8).toUpperCase()}`,
        template: OrderConfirmation,
        props: { customerName, orderId, items, total, shippingAddress, orderDate }
      }),
      sendEmail({
        to: process.env.ADMIN_EMAIL || process.env.SMTP_USER || "",
        subject: `[ACTION REQUIRED] New Order #${orderId.slice(0, 8).toUpperCase()}`,
        template: NewOrderAdminNotification,
        props: { customerName, orderId, items, total }
      })
    ]);
  } catch(e) { console.error("Failed to send Order Emails:", e); }
}

export async function dispatchOrderStatusUpdate(email: string, orderId: string, status: string, trackingInfo?: string) {
  try {
    const capitalizedStatus = status.charAt(0).toUpperCase() + status.slice(1);
    await sendEmail({
      to: email,
      subject: `Order #${orderId.slice(0, 8).toUpperCase()} is now ${capitalizedStatus}`,
      template: OrderStatusUpdate,
      props: { orderId, status, trackingInfo }
    });
  } catch(e) { console.error("Failed to send OrderStatusUpdate:", e); }
}

export async function dispatchPaymentConfirmed(email: string, orderId: string, customerName: string) {
  try {
    await sendEmail({
      to: email,
      subject: `Payment Confirmed for Order #${orderId.slice(0, 8).toUpperCase()}`,
      template: PaymentConfirmed,
      props: { orderId, customerName }
    });
  } catch(e) { console.error("Failed to send PaymentConfirmed:", e); }
}
