import { Text, Section } from "@react-email/components";
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
      previewText={`Payment Confirmed — #${shortId}`}
      accentColor="#16a34a"
      accentLabel="Payment Successful"
      logoUrl={logoUrl}
      shopUrl={shopUrl}
    >
      {/* Hero */}
      <Section style={{ textAlign: "center", marginBottom: "28px" }}>
        <Text style={{ fontSize: "28px", fontWeight: "900", color: "#000000", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Payment Confirmed!
        </Text>
        <Text style={{ fontSize: "15px", color: "#666666", lineHeight: "24px", margin: "0" }}>
          Hi <strong style={{ color: "#000000" }}>{customerName}</strong>, we've successfully verified your payment.
          Your order is now being processed by our fulfillment team.
        </Text>
      </Section>

      {/* Amount Card */}
      {amount !== undefined && (
        <Section style={{ backgroundColor: "#f0fdf4", border: "1.5px solid #bbf7d0", borderRadius: "16px", padding: "20px 24px", marginBottom: "24px", textAlign: "center" }}>
          <Text style={{ fontSize: "10px", fontWeight: "800", color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 6px" }}>
            Amount Paid
          </Text>
          <Text style={{ fontSize: "32px", fontWeight: "900", color: "#15803d", margin: "0" }}>
            {currency}{Number(amount).toFixed(2)}
          </Text>
        </Section>
      )}

      {/* Order ID */}
      <Section style={{ backgroundColor: "#f8f8f8", borderRadius: "16px", padding: "16px 24px", marginBottom: "28px" }}>
        <Text style={{ fontSize: "10px", fontWeight: "800", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 4px" }}>
          Order Reference
        </Text>
        <Text style={{ fontSize: "18px", fontWeight: "900", color: "#000000", margin: "0", fontFamily: "monospace", letterSpacing: "0.1em" }}>
          #{shortId}
        </Text>
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: "center" }}>
        <PrimaryButton href={orderUrl} color="#16a34a">
          View Order Status →
        </PrimaryButton>
        <Text style={{ fontSize: "12px", color: "#aaaaaa", margin: "12px 0 0" }}>
          We'll notify you as soon as your package ships.
        </Text>
      </Section>
    </BaseLayout>
  );
}
