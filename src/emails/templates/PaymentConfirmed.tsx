import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../components/Layout";
import { PrimaryButton } from "../components/Button";
import { getShopUrl } from "../utils";

import { OrderSummary } from "../components/OrderSummary";

interface PaymentConfirmedProps {
  orderId: string;
  customerName: string;
  amount?: number;
  currency?: string;
  items?: any[];
  total?: number;
  deliveryCharge?: number;
  discount?: number;
  paymentMethod?: string;
  logoUrl?: string;
  shopUrl?: string;
}

export default function PaymentConfirmed({
  orderId,
  customerName,
  amount,
  currency = "৳",
  items,
  total,
  deliveryCharge,
  discount,
  paymentMethod,
  logoUrl,
  shopUrl: propShop
}: PaymentConfirmedProps) {
  const shopUrl = propShop || getShopUrl();
  const orderUrl = `${shopUrl}/account?tab=orders`;
  const shortId = orderId.slice(0, 8).toUpperCase();

  return (
    <BaseLayout
      previewText={`💰 Payment Confirmed — Order #${shortId}`}
      accentColor="#16a34a"
      accentLabel="Payment Successful"
      badgeEmoji="💰"
      logoUrl={logoUrl}
      shopUrl={shopUrl}
    >
      {/* Hero */}
      <Section style={{ textAlign: "center", marginBottom: "32px" }}>
        <Text style={heroEmoji}>💳</Text>
        <Text style={heroTitle}>Payment Received!</Text>
        <Text style={heroSub}>
          Hi <strong style={{ color: "#111111" }}>{customerName}</strong>, we've successfully verified your payment.
          Your order is now being processed and readied for shipment.
        </Text>
      </Section>

      {/* Amount Card — Emphasized */}
      {amount !== undefined && (
        <Section style={amountBox}>
          <Text style={boxLabel}>Total Paid</Text>
          <Text style={amountText}>
            {currency}{Number(amount).toFixed(2)}
          </Text>
          <Text style={orderRef}>Order Ref: #{shortId}</Text>
        </Section>
      )}

      {/* Order Summary — Full details */}
      {items && (
        <OrderSummary 
          items={items} 
          total={total || amount || 0} 
          deliveryCharge={deliveryCharge} 
          discount={discount}
          paymentMethod={paymentMethod}
        />
      )}

      {/* CTA */}
      <Section style={{ textAlign: "center" }}>
        <PrimaryButton href={orderUrl} color="#16a34a">
          View Order Status →
        </PrimaryButton>
        <Text style={ctaNote}>
          We'll notify you as soon as your package ships.
        </Text>
      </Section>
    </BaseLayout>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────── */
const heroEmoji: React.CSSProperties   = { fontSize: "48px", margin: "0 0 8px", textAlign: "center" };
const heroTitle: React.CSSProperties   = { fontSize: "32px", fontWeight: "900", color: "#111111", margin: "0 0 14px", letterSpacing: "-0.03em" };
const heroSub: React.CSSProperties     = { fontSize: "15px", color: "#555555", lineHeight: "26px", margin: "0" };

const amountBox: React.CSSProperties   = { backgroundColor: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "20px", padding: "28px", marginBottom: "32px", textAlign: "center" };
const boxLabel: React.CSSProperties    = { fontSize: "10px", fontWeight: "800", color: "#16a34a", textTransform: "uppercase" as const, letterSpacing: "0.2em", margin: "0 0 8px" };
const amountText: React.CSSProperties  = { fontSize: "36px", fontWeight: "900", color: "#15803d", margin: "0" };
const orderRef: React.CSSProperties    = { fontSize: "11px", fontWeight: "700", color: "#16a34a", textTransform: "uppercase" as const, letterSpacing: "0.1em", marginTop: "8px", opacity: 0.7 };
const ctaNote: React.CSSProperties     = { fontSize: "12px", color: "#aaaaaa", margin: "16px 0 0" };
