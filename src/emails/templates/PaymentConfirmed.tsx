import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../components/Layout";
import { PrimaryButton } from "../components/Button";
import { getShopUrl } from "../utils";

interface PaymentConfirmedProps {
  orderId: string;
  customerName: string;
  amount?: number;
  currency?: string;
  logoUrl?: string;
  shopUrl?: string;
}

export default function PaymentConfirmed({
  orderId,
  customerName,
  amount,
  currency = "৳",
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
      <Section style={{ textAlign: "center", marginBottom: "36px" }}>
        <Text style={heroEmoji}>💳</Text>
        <Text style={heroTitle}>Payment Received!</Text>
        <Text style={heroSub}>
          Hi <strong style={{ color: "#111111" }}>{customerName}</strong>, we've successfully verified your payment.
          Your order is now being processed and readied for shipment.
        </Text>
      </Section>

      {/* Amount Card */}
      {amount !== undefined && (
        <Section style={amountBox}>
          <Text style={boxLabel}>Total Paid</Text>
          <Text style={amountText}>
            {currency}{Number(amount).toFixed(2)}
          </Text>
        </Section>
      )}

      {/* Order Info */}
      <Section style={infoBox}>
        <Row>
          <Column style={{ textAlign: "center" }}>
            <Text style={boxLabel}>Order Reference</Text>
            <Text style={shortIdText}>#{shortId}</Text>
          </Column>
        </Row>
      </Section>

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

const amountBox: React.CSSProperties   = { backgroundColor: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "20px", padding: "28px", marginBottom: "24px", textAlign: "center" };
const infoBox: React.CSSProperties     = { backgroundColor: "#f8f8f8", borderRadius: "16px", padding: "20px 24px", marginBottom: "32px" };

const boxLabel: React.CSSProperties    = { fontSize: "10px", fontWeight: "800", color: "#16a34a", textTransform: "uppercase" as const, letterSpacing: "0.2em", margin: "0 0 8px" };
const amountText: React.CSSProperties  = { fontSize: "36px", fontWeight: "900", color: "#15803d", margin: "0" };
const shortIdText: React.CSSProperties = { fontSize: "20px", fontWeight: "900", color: "#111111", margin: "0", fontFamily: "monospace", letterSpacing: "0.1em" };
const ctaNote: React.CSSProperties     = { fontSize: "12px", color: "#aaaaaa", margin: "16px 0 0" };
