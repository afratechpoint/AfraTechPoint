import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../components/Layout";
import { OrderSummary } from "../components/OrderSummary";
import { PrimaryButton } from "../components/Button";
import { getShopUrl } from "../utils";

interface OrderConfirmationProps {
  customerName: string;
  orderId: string;
  items: Array<{ name: string; price: number; quantity: number; variantName?: string }>;
  total: number;
  shippingAddress: any;
  orderDate: string | Date;
  deliveryCharge?: number;
  logoUrl?: string;
  shopUrl?: string;
}

export default function OrderConfirmation({
  customerName,
  orderId,
  items,
  total,
  shippingAddress,
  orderDate,
  deliveryCharge,
  logoUrl,
  shopUrl: propShop,
}: OrderConfirmationProps) {
  const shopUrl  = propShop || getShopUrl();
  const orderUrl = `${shopUrl}/account?tab=orders`;
  const shortId  = orderId.slice(0, 8).toUpperCase();

  const formattedDate = new Date(orderDate).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  return (
    <BaseLayout
      previewText={`✅ Order Confirmed — #${shortId}. We're preparing it now!`}
      accentColor="#16a34a"
      accentLabel={`Order #${shortId} Confirmed`}
      badgeEmoji="✅"
      logoUrl={logoUrl}
      shopUrl={shopUrl}
    >
      {/* Hero */}
      <Section style={{ textAlign: "center", marginBottom: "32px" }}>
        <Text style={heroEmoji}>🎉</Text>
        <Text style={heroTitle}>Order Confirmed!</Text>
        <Text style={heroSub}>
          Hi <strong style={{ color: "#111111" }}>{customerName}</strong>, your order has been received and
          we're already preparing it. You'll receive a shipping notification soon.
        </Text>
      </Section>

      {/* Info strip */}
      <Section style={infoStrip}>
        <Row>
          <Column style={{ textAlign: "center", borderRight: "1px solid #e5e5e5" }}>
            <Text style={infoLabel}>Order ID</Text>
            <Text style={infoValue}>#{shortId}</Text>
          </Column>
          <Column style={{ textAlign: "center" }}>
            <Text style={infoLabel}>Date</Text>
            <Text style={infoValue}>{formattedDate}</Text>
          </Column>
        </Row>
      </Section>

      {/* Order Summary */}
      <OrderSummary items={items} total={total} deliveryCharge={deliveryCharge} />

      {/* Shipping Info */}
      <Section style={shippingBox}>
        <Text style={boxLabel}>📍 &nbsp;Shipping To</Text>
        <Text style={shippingName}>{shippingAddress?.fullName}</Text>
        <Text style={shippingAddr}>
          {shippingAddress?.address}<br />
          {shippingAddress?.city}{shippingAddress?.postalCode ? `, ${shippingAddress.postalCode}` : ""}<br />
          📞 {shippingAddress?.phone}
        </Text>
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: "center", marginTop: "8px" }}>
        <PrimaryButton href={orderUrl} color="#16a34a">
          Track Your Order →
        </PrimaryButton>
        <Text style={ctaNote}>
          We'll send you an email the moment your order ships.
        </Text>
      </Section>
    </BaseLayout>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────── */
const heroEmoji: React.CSSProperties   = { fontSize: "48px", margin: "0 0 8px", textAlign: "center" };
const heroTitle: React.CSSProperties   = { fontSize: "32px", fontWeight: "900", color: "#111111", margin: "0 0 14px", letterSpacing: "-0.03em" };
const heroSub: React.CSSProperties     = { fontSize: "15px", color: "#555555", lineHeight: "26px", margin: "0" };

const infoStrip: React.CSSProperties   = { backgroundColor: "#f7f7f7", borderRadius: "16px", padding: "20px 0", marginBottom: "28px" };
const infoLabel: React.CSSProperties   = { fontSize: "10px", fontWeight: "700", color: "#aaaaaa", textTransform: "uppercase" as const, letterSpacing: "0.2em", margin: "0 0 4px" };
const infoValue: React.CSSProperties   = { fontSize: "13px", fontWeight: "800", color: "#111111", margin: "0" };

const shippingBox: React.CSSProperties = { backgroundColor: "#f7f7f7", borderRadius: "16px", padding: "20px 24px", marginBottom: "28px" };
const boxLabel: React.CSSProperties    = { fontSize: "10px", fontWeight: "800", color: "#aaaaaa", textTransform: "uppercase" as const, letterSpacing: "0.2em", margin: "0 0 12px" };
const shippingName: React.CSSProperties = { fontSize: "15px", fontWeight: "800", color: "#111111", margin: "0 0 6px" };
const shippingAddr: React.CSSProperties = { fontSize: "13px", color: "#555555", margin: "0", lineHeight: "22px" };
const ctaNote: React.CSSProperties     = { fontSize: "12px", color: "#aaaaaa", margin: "16px 0 0" };
