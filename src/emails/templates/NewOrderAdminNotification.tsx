import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../components/Layout";
import { OrderSummary } from "../components/OrderSummary";
import { PrimaryButton } from "../components/Button";
import { getShopUrl } from "../utils";

/* ── Styles (সব কম্পোনেন্টের আগে) ───────────────────────────────────── */
const heroTitle: React.CSSProperties = {
  fontSize: "32px",
  fontWeight: "900",
  color: "#111111",
  margin: "0 0 14px",
  letterSpacing: "-0.03em",
};

const heroSub: React.CSSProperties = {
  fontSize: "15px",
  color: "#555555",
  lineHeight: "26px",
  margin: "0",
};

const statsBox: React.CSSProperties = {
  backgroundColor: "#fef2f2",
  border: "1.5px solid #fecaca",
  borderRadius: "16px",
  padding: "20px 0",
  marginBottom: "20px",
};

const statsLabel: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: "700",
  color: "#991b1b",
  textTransform: "uppercase" as const,
  letterSpacing: "0.2em",
  margin: "0 0 4px",
};

const statsValue: React.CSSProperties = {
  fontSize: "18px",
  fontWeight: "900",
  color: "#b91c1c",
  margin: "0",
};

const statsId: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "900",
  color: "#111111",
  margin: "0",
  fontFamily: "monospace",
};

const detailsBox: React.CSSProperties = {
  backgroundColor: "#f7f7f7",
  borderRadius: "16px",
  padding: "20px 24px",
  marginBottom: "16px",
};

const boxLabel: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: "800",
  color: "#aaaaaa",
  textTransform: "uppercase" as const,
  letterSpacing: "0.2em",
  margin: "0 0 12px",
};

const customerNameStyle: React.CSSProperties = {
  fontSize: "16px",
  fontWeight: "800",
  color: "#111111",
  margin: "0 0 4px",
};

const customerEmailStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#666666",
  margin: "0",
};

const shippingAddressStyle: React.CSSProperties = {
  fontSize: "13px",
  color: "#333333",
  margin: "0",
  lineHeight: "22px",
};

/* ── Component ──────────────────────────────────────────────────────── */
interface NewOrderAdminProps {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  total: number;
  items: Array<{ name: string; price: number; quantity: number; variantName?: string }>;
  shippingAddress?: any;
  deliveryCharge?: number;
  discount?: number;
  paymentMethod?: string;
  logoUrl?: string;
  shopUrl?: string;
}

export default function NewOrderAdminNotification({
  orderId,
  customerName,
  customerEmail,
  total,
  items,
  shippingAddress,
  deliveryCharge,
  discount,
  paymentMethod,
  logoUrl,
  shopUrl,
}: NewOrderAdminProps) {
  const finalShopUrl = shopUrl || getShopUrl();
  const adminUrl = `${finalShopUrl}/admin/orders/${orderId}`;
  const shortId = orderId.slice(0, 8).toUpperCase();
  const finalLogoUrl = logoUrl || "https://i.ibb.co.com/TqvmBZyc/logo-wbg.png";

  return (
    <BaseLayout
      previewText={`🚨 New Order #${shortId} — Action Required!`}
      accentColor="#dc2626"
      accentLabel="Admin Alert — New Sale"
      badgeEmoji="🚨"
      logoUrl={finalLogoUrl}
      shopUrl={shopUrl}
    >
      {/* Hero */}
      <Section style={{ textAlign: "center", marginBottom: "32px" }}>
        <Text style={heroTitle}>New Order Received! 💰</Text>
        <Text style={heroSub}>
          A new purchase has been placed. Review and fulfill as soon as possible.
        </Text>
      </Section>

      {/* Order Stats */}
      <Section style={statsBox}>
        <Row>
          <Column
            style={{ width: "50%", textAlign: "center", borderRight: "1px solid #e5e5e5" }}
          >
            <Text style={statsLabel}>Sale Amount</Text>
            <Text style={statsValue}>৳{Number(total).toFixed(2)}</Text>
          </Column>
          <Column style={{ width: "50%", textAlign: "center" }}>
            <Text style={statsLabel}>Order ID</Text>
            <Text style={statsId}>#{shortId}</Text>
          </Column>
        </Row>
      </Section>

      {/* Customer Info */}
      <Section style={detailsBox}>
        <Text style={boxLabel}>👤 &nbsp;Customer</Text>
        <Text style={customerNameStyle}>{customerName}</Text>
        {customerEmail && <Text style={customerEmailStyle}>{customerEmail}</Text>}
      </Section>

      {/* Shipping */}
      {shippingAddress && (
        <Section style={detailsBox}>
          <Text style={boxLabel}>📍 &nbsp;Ship To</Text>
          <Text style={shippingAddressStyle}>
            <strong>{shippingAddress.fullName}</strong>
            <br />
            {shippingAddress.address}
            <br />
            {shippingAddress.city}
            {shippingAddress.postalCode ? `, ${shippingAddress.postalCode}` : ""}
            <br />
            📞 {shippingAddress.phone}
          </Text>
        </Section>
      )}

      {/* Order Summary */}
      <OrderSummary
        items={items}
        total={total}
        deliveryCharge={deliveryCharge}
        discount={discount}
        paymentMethod={paymentMethod}
      />

      {/* CTA */}
      <Section style={{ textAlign: "center" }}>
        <PrimaryButton href={adminUrl} color="#dc2626">
          Review in Admin Panel →
        </PrimaryButton>
      </Section>
    </BaseLayout>
  );
}