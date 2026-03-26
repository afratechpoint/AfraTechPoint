import { Text, Section } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../components/Layout";
import { PrimaryButton } from "../components/Button";

interface OrderStatusUpdateProps {
  orderId: string;
  customerName?: string;
  status: string;
  trackingInfo?: string;
}

const STATUS_CONFIG: Record<string, { color: string; label: string; message: string }> = {
  processing:  { color: "#f59e0b", label: "Processing",   message: "We're preparing your order with care." },
  shipped:     { color: "#3b82f6", label: "Shipped",      message: "Your order is on its way to you!" },
  delivered:   { color: "#16a34a", label: "Delivered",    message: "Your order has arrived. Enjoy!" },
  cancelled:   { color: "#ef4444", label: "Cancelled",    message: "Your order has been cancelled." },
  refunded:    { color: "#8b5cf6", label: "Refunded",     message: "Your refund has been processed." },
  default:     { color: "#000000", label: "Updated",      message: "Your order status has been updated." },
};

export default function OrderStatusUpdate({ orderId, customerName, status, trackingInfo }: OrderStatusUpdateProps) {
  const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || "https://yourdomain.com";
  const orderUrl = `${shopUrl}/account?tab=orders`;
  const shortId = orderId.slice(0, 8).toUpperCase();
  const cfg = STATUS_CONFIG[status.toLowerCase()] || STATUS_CONFIG.default;

  return (
    <BaseLayout
      previewText={`Order #${shortId} — ${cfg.label}`}
      accentColor={cfg.color}
      accentLabel={`Order Status: ${cfg.label}`}
    >
      {/* Hero */}
      <Section style={{ textAlign: "center", marginBottom: "28px" }}>
        <Text style={{ fontSize: "28px", fontWeight: "900", color: "#000000", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          {cfg.label}!
        </Text>
        <Text style={{ fontSize: "15px", color: "#666666", lineHeight: "24px", margin: "0" }}>
          {customerName && <><strong style={{ color: "#000000" }}>{customerName}</strong>, </>}
          {cfg.message}<br />
          <span style={{ color: "#aaaaaa", fontSize: "13px" }}>Order <strong style={{ fontFamily: "monospace", color: "#333333" }}>#{shortId}</strong></span>
        </Text>
      </Section>

      {/* Tracking Info */}
      {trackingInfo && (
        <Section style={{ backgroundColor: "#f8f8f8", borderRadius: "16px", padding: "20px 24px", marginBottom: "28px" }}>
          <Text style={{ fontSize: "10px", fontWeight: "800", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 8px" }}>
            Tracking Number
          </Text>
          <Text style={{ fontSize: "18px", fontWeight: "900", color: "#000000", margin: "0", fontFamily: "monospace", letterSpacing: "0.1em" }}>
            {trackingInfo}
          </Text>
        </Section>
      )}

      {/* Steps indicator */}
      <Section style={{ backgroundColor: "#f8f8f8", borderRadius: "16px", padding: "20px 24px", marginBottom: "28px" }}>
        {[
          { label: "Order Placed", done: true },
          { label: "Processing", done: ["processing","shipped","delivered"].includes(status.toLowerCase()) },
          { label: "Shipped", done: ["shipped","delivered"].includes(status.toLowerCase()) },
          { label: "Delivered", done: status.toLowerCase() === "delivered" },
        ].map((step, i) => (
          <Text key={i} style={{ fontSize: "13px", color: step.done ? "#000000" : "#cccccc", fontWeight: step.done ? "800" : "500", margin: "0 0 6px", display: "block" }}>
            {step.done ? "✓" : "○"}  {step.label}
          </Text>
        ))}
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: "center" }}>
        <PrimaryButton href={orderUrl} color={cfg.color}>
          Track Your Order →
        </PrimaryButton>
      </Section>
    </BaseLayout>
  );
}
