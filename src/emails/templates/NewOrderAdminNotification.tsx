import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../components/Layout";
import { OrderSummary } from "../components/OrderSummary";
import { PrimaryButton } from "../components/Button";

interface NewOrderAdminProps {
  orderId: string;
  customerName: string;
  customerEmail?: string;
  total: number;
  items: Array<{ name: string; price: number; quantity: number }>;
  shippingAddress?: any;
}

export default function NewOrderAdminNotification({
  orderId,
  customerName,
  customerEmail,
  total,
  items,
  shippingAddress
}: NewOrderAdminProps) {
  const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || "https://yourdomain.com";
  const adminUrl = `${shopUrl}/admin/orders/${orderId}`;
  const shortId = orderId.slice(0, 8).toUpperCase();

  return (
    <BaseLayout
      previewText={`New Order #${shortId} — Action Required`}
      accentColor="#dc2626"
      accentLabel="Admin Alert — New Order"
    >
      {/* Hero */}
      <Section style={{ textAlign: "center", marginBottom: "28px" }}>
        <Text style={{ fontSize: "28px", fontWeight: "900", color: "#000000", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          New Order Received!
        </Text>
        <Text style={{ fontSize: "15px", color: "#666666", lineHeight: "24px", margin: "0" }}>
          A new purchase has been placed. Please review and begin fulfillment as soon as possible.
        </Text>
      </Section>

      {/* Customer Info */}
      <Section style={{ backgroundColor: "#f8f8f8", borderRadius: "16px", padding: "20px 24px", marginBottom: "20px" }}>
        <Text style={{ fontSize: "10px", fontWeight: "800", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 12px" }}>
          Customer Details
        </Text>
        <Row>
          <Column>
            <Text style={{ fontSize: "15px", fontWeight: "800", color: "#000000", margin: "0 0 2px" }}>{customerName}</Text>
            {customerEmail && <Text style={{ fontSize: "13px", color: "#666666", margin: "0" }}>{customerEmail}</Text>}
          </Column>
          <Column align="right">
            <Text style={{ fontSize: "11px", fontWeight: "700", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 2px" }}>Order ID</Text>
            <Text style={{ fontSize: "14px", fontWeight: "900", color: "#000000", fontFamily: "monospace", margin: "0" }}>#{shortId}</Text>
          </Column>
        </Row>
      </Section>

      {/* Shipping */}
      {shippingAddress && (
        <Section style={{ backgroundColor: "#f8f8f8", borderRadius: "16px", padding: "20px 24px", marginBottom: "20px" }}>
          <Text style={{ fontSize: "10px", fontWeight: "800", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 8px" }}>
            Ship To
          </Text>
          <Text style={{ fontSize: "13px", color: "#333333", margin: "0", lineHeight: "22px" }}>
            <strong>{shippingAddress.fullName}</strong><br />
            {shippingAddress.address}<br />
            {shippingAddress.city}{shippingAddress.postalCode ? `, ${shippingAddress.postalCode}` : ""}<br />
            {shippingAddress.phone}
          </Text>
        </Section>
      )}

      {/* Order Summary */}
      <OrderSummary items={items} total={total} />

      {/* CTA */}
      <Section style={{ textAlign: "center" }}>
        <PrimaryButton href={adminUrl} color="#dc2626">
          Open in Dashboard →
        </PrimaryButton>
      </Section>
    </BaseLayout>
  );
}
