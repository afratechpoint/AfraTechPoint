import { Text, Section, Row, Column, Link } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../components/Layout";
import { OrderSummary } from "../components/OrderSummary";
import { PrimaryButton } from "../components/Button";
import { getShopUrl } from "../utils";

interface OrderConfirmationProps {
  customerName: string;
  orderId: string;
  items: Array<{ name: string; price: number; quantity: number }>;
  total: number;
  shippingAddress: any;
  orderDate: string | Date;
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
  logoUrl,
  shopUrl: propShop
}: OrderConfirmationProps) {
  const shopUrl = propShop || getShopUrl();
  const orderUrl = `${shopUrl}/account?tab=orders`;
  const shortId = orderId.slice(0, 8).toUpperCase();

  const formattedDate = new Date(orderDate).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric"
  });

  return (
    <BaseLayout
      previewText={`Order Confirmed — #${shortId}`}
      accentColor="#000000"
      accentLabel={`Order #${shortId} Confirmed`}
      logoUrl={logoUrl}
      shopUrl={shopUrl}
    >
      {/* Hero */}
      <Section style={{ textAlign: "center", marginBottom: "28px" }}>
        <Text style={{ fontSize: "28px", fontWeight: "900", color: "#000000", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Order Confirmed!
        </Text>
        <Text style={{ fontSize: "15px", color: "#666666", lineHeight: "24px", margin: "0" }}>
          Hi <strong style={{ color: "#000000" }}>{customerName}</strong>, thank you for your purchase.
          We're preparing your order now and will notify you once it ships.
        </Text>
      </Section>

      {/* Order Summary */}
      <OrderSummary items={items} total={total} />

      {/* Shipping Info */}
      <Section style={{ backgroundColor: "#f8f8f8", borderRadius: "16px", padding: "20px 24px", marginBottom: "28px" }}>
        <Text style={{ fontSize: "10px", fontWeight: "800", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 12px" }}>
          Shipping To
        </Text>
        <Text style={{ fontSize: "15px", fontWeight: "800", color: "#000000", margin: "0 0 4px" }}>
          {shippingAddress?.fullName}
        </Text>
        <Text style={{ fontSize: "13px", color: "#555555", margin: "0", lineHeight: "22px" }}>
          {shippingAddress?.address}<br />
          {shippingAddress?.city}{shippingAddress?.postalCode ? `, ${shippingAddress.postalCode}` : ""}<br />
          {shippingAddress?.phone}
        </Text>
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: "center" }}>
        <PrimaryButton href={orderUrl}>Track Your Order →</PrimaryButton>
        <Text style={{ fontSize: "12px", color: "#aaaaaa", margin: "12px 0 0" }}>
          Placed on {formattedDate}
        </Text>
      </Section>
    </BaseLayout>
  );
}
