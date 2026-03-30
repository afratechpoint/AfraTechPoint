import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../components/Layout";
import { PrimaryButton } from "../components/Button";
import { getShopUrl } from "../utils";

interface OrderStatusUpdateProps {
  orderId: string;
  customerName?: string;
  status: string;
  trackingInfo?: string;
  logoUrl?: string;
  shopUrl?: string;
}

type StatusConfig = {
  color: string;
  emoji: string;
  label: string;
  message: string;
  steps: { label: string; done: (s: string) => boolean }[];
};

const STATUS_CONFIG: Record<string, StatusConfig> = {
  processing: {
    color:   "#f59e0b",
    emoji:   "⚙️",
    label:   "Processing",
    message: "We're carefully preparing your order. Our team is on it!",
    steps: [
      { label: "Order Placed",   done: () => true },
      { label: "Processing",     done: (s) => ["processing","shipped","delivered"].includes(s) },
      { label: "Shipped",        done: (s) => ["shipped","delivered"].includes(s) },
      { label: "Delivered",      done: (s) => s === "delivered" },
    ],
  },
  shipped: {
    color:   "#3b82f6",
    emoji:   "🚚",
    label:   "Shipped",
    message: "Your order is on its way! Estimated delivery is soon.",
    steps: [
      { label: "Order Placed",   done: () => true },
      { label: "Processing",     done: () => true },
      { label: "Shipped",        done: (s) => ["shipped","delivered"].includes(s) },
      { label: "Delivered",      done: (s) => s === "delivered" },
    ],
  },
  delivered: {
    color:   "#16a34a",
    emoji:   "✅",
    label:   "Delivered",
    message: "Your order has been delivered. We hope you love it!",
    steps: [
      { label: "Order Placed",   done: () => true },
      { label: "Processing",     done: () => true },
      { label: "Shipped",        done: () => true },
      { label: "Delivered",      done: () => true },
    ],
  },
  cancelled: {
    color:   "#ef4444",
    emoji:   "❌",
    label:   "Cancelled",
    message: "Your order has been cancelled. If this was a mistake, please contact us.",
    steps: [],
  },
  refunded: {
    color:   "#8b5cf6",
    emoji:   "💸",
    label:   "Refunded",
    message: "Your refund has been processed. It may take 3–5 business days to appear.",
    steps: [],
  },
};

const DEFAULT_CONFIG: StatusConfig = {
  color:   "#111111",
  emoji:   "📋",
  label:   "Updated",
  message: "Your order status has been updated.",
  steps: [],
};

export default function OrderStatusUpdate({
  orderId, customerName, status, trackingInfo, logoUrl, shopUrl: propShop,
}: OrderStatusUpdateProps) {
  const shopUrl = propShop || getShopUrl();
  const orderUrl = `${shopUrl}/account?tab=orders`;
  const shortId = orderId.slice(0, 8).toUpperCase();
  const s = status.toLowerCase();
  const cfg = STATUS_CONFIG[s] || DEFAULT_CONFIG;

  return (
    <BaseLayout
      previewText={`${cfg.emoji} Order #${shortId} is now ${cfg.label}`}
      accentColor={cfg.color}
      accentLabel={`Order Status: ${cfg.label}`}
      badgeEmoji={cfg.emoji}
      logoUrl={logoUrl}
      shopUrl={shopUrl}
    >
      {/* Hero */}
      <Section style={{ textAlign: "center", marginBottom: "32px" }}>
        <Text style={{ fontSize: "52px", margin: "0 0 8px" }}>{cfg.emoji}</Text>
        <Text style={heroTitle}>{cfg.label}!</Text>
        <Text style={heroSub}>
          {customerName && <><strong style={{ color: "#111111" }}>{customerName}</strong>, </>}
          {cfg.message}
        </Text>
        <Text style={orderIdBadge}>Order <span style={{ fontFamily: "monospace", fontWeight: "900" }}>#{shortId}</span></Text>
      </Section>

      {/* Tracking Number */}
      {trackingInfo && (
        <Section style={trackingBox}>
          <Text style={boxLabel}>🔍 &nbsp;Tracking Number</Text>
          <Text style={trackingCode}>{trackingInfo}</Text>
          <Text style={trackingNote}>Use this number to track your package with the courier.</Text>
        </Section>
      )}

      {/* Progress Steps */}
      {cfg.steps.length > 0 && (
        <Section style={stepsBox}>
          <Text style={boxLabel}>📋 &nbsp;Order Progress</Text>
          {cfg.steps.map((step, i) => {
            const done = step.done(s);
            return (
              <Row key={i} style={{ marginBottom: i < cfg.steps.length - 1 ? "12px" : "0" }}>
                <Column style={{ width: "32px", verticalAlign: "middle" }}>
                  <Text style={{
                    ...stepBadge,
                    backgroundColor: done ? cfg.color : "#eeeeee",
                    color: done ? "#ffffff" : "#bbbbbb",
                  }}>
                    {done ? "✓" : String(i + 1)}
                  </Text>
                </Column>
                <Column style={{ verticalAlign: "middle" }}>
                  <Text style={{ ...stepLabel, color: done ? "#111111" : "#cccccc", fontWeight: done ? "800" : "500" }}>
                    {step.label}
                  </Text>
                </Column>
              </Row>
            );
          })}
        </Section>
      )}

      {/* CTA */}
      <Section style={{ textAlign: "center", marginTop: "8px" }}>
        <PrimaryButton href={orderUrl} color={cfg.color}>
          View Order Details →
        </PrimaryButton>
      </Section>
    </BaseLayout>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────── */
const heroTitle: React.CSSProperties     = { fontSize: "32px", fontWeight: "900", color: "#111111", margin: "0 0 12px", letterSpacing: "-0.03em" };
const heroSub: React.CSSProperties       = { fontSize: "15px", color: "#555555", lineHeight: "26px", margin: "0 0 12px" };
const orderIdBadge: React.CSSProperties  = { display: "inline-block", fontSize: "12px", color: "#888888", backgroundColor: "#f7f7f7", borderRadius: "8px", padding: "4px 12px", margin: "4px auto 0" };

const trackingBox: React.CSSProperties   = { backgroundColor: "#f7f7f7", borderRadius: "16px", padding: "20px 24px", marginBottom: "20px" };
const stepsBox: React.CSSProperties      = { backgroundColor: "#f7f7f7", borderRadius: "16px", padding: "20px 24px", marginBottom: "28px" };
const boxLabel: React.CSSProperties      = { fontSize: "10px", fontWeight: "800", color: "#aaaaaa", textTransform: "uppercase" as const, letterSpacing: "0.2em", margin: "0 0 14px" };
const trackingCode: React.CSSProperties  = { fontSize: "22px", fontWeight: "900", color: "#111111", margin: "0 0 6px", fontFamily: "monospace", letterSpacing: "0.1em" };
const trackingNote: React.CSSProperties  = { fontSize: "12px", color: "#888888", margin: "0" };
const stepBadge: React.CSSProperties     = { width: "24px", height: "24px", borderRadius: "50%", fontSize: "11px", fontWeight: "800", textAlign: "center" as const, lineHeight: "24px", margin: "0" };
const stepLabel: React.CSSProperties     = { fontSize: "13px", margin: "0" };
