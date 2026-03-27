import { Text, Section, Link } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../components/Layout";
import { PrimaryButton } from "../components/Button";
import { getShopUrl } from "../utils";

// ── Auto-Reply ───────────────────────────────────────────────────────
interface ContactAutoReplyProps {
  name: string;
  logoUrl?: string;
  shopUrl?: string;
}

export function ContactAutoReply({ name, logoUrl, shopUrl: propShop }: ContactAutoReplyProps) {
  const shopUrl = propShop || getShopUrl();

  return (
    <BaseLayout
      previewText="We received your message — we'll be in touch soon!"
      accentColor="#7c3aed"
      accentLabel="Message Received"
      logoUrl={logoUrl}
      shopUrl={shopUrl}
    >
      <Section style={{ textAlign: "center", marginBottom: "28px" }}>
        <Text style={{ fontSize: "28px", fontWeight: "900", color: "#000000", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          We Got Your Message!
        </Text>
        <Text style={{ fontSize: "15px", color: "#666666", lineHeight: "26px", margin: "0" }}>
          Hi <strong style={{ color: "#000000" }}>{name}</strong>, thank you for reaching out.
          Our support team has received your inquiry and will get back to you within <strong style={{ color: "#000000" }}>24–48 hours</strong>.
        </Text>
      </Section>

      <Section style={{ backgroundColor: "#f5f3ff", border: "1.5px solid #ddd6fe", borderRadius: "16px", padding: "20px 24px", marginBottom: "28px" }}>
        <Text style={{ fontSize: "13px", color: "#5b21b6", lineHeight: "22px", margin: "0" }}>
          While you wait, you can browse our <Link href={shopUrl} style={{ color: "#7c3aed", fontWeight: "700" }}>product catalog</Link> or check your <Link href={`${shopUrl}/account`} style={{ color: "#7c3aed", fontWeight: "700" }}>order history</Link>.
        </Text>
      </Section>

      <Section style={{ textAlign: "center" }}>
        <PrimaryButton href={shopUrl} color="#7c3aed">
          Visit Afra Tech Point →
        </PrimaryButton>
        <Text style={{ fontSize: "12px", color: "#aaaaaa", margin: "12px 0 0" }}>
          We typically respond within 24 hours.
        </Text>
      </Section>
    </BaseLayout>
  );
}

// ── Admin Notification ───────────────────────────────────────────────
interface ContactAdminProps {
  name: string;
  email: string;
  message: string;
  subject?: string;
  logoUrl?: string;
  shopUrl?: string;
}

export function ContactAdminNotification({ name, email, message, subject, logoUrl, shopUrl }: ContactAdminProps) {
  return (
    <BaseLayout
      previewText={`New Contact Inquiry from ${name}`}
      accentColor="#7c3aed"
      accentLabel="New Customer Inquiry"
      logoUrl={logoUrl}
      shopUrl={shopUrl}
    >
      <Section style={{ textAlign: "center", marginBottom: "28px" }}>
        <Text style={{ fontSize: "26px", fontWeight: "900", color: "#000000", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          New Inquiry Received
        </Text>
      </Section>

      {/* Sender Details */}
      <Section style={{ backgroundColor: "#f8f8f8", borderRadius: "16px", padding: "20px 24px", marginBottom: "16px" }}>
        <Text style={{ fontSize: "10px", fontWeight: "800", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 12px" }}>
          Sender
        </Text>
        <Text style={{ fontSize: "16px", fontWeight: "800", color: "#000000", margin: "0 0 4px" }}>{name}</Text>
        <Text style={{ fontSize: "13px", color: "#666666", margin: "0" }}>{email}</Text>
        {subject && <Text style={{ fontSize: "13px", color: "#888888", margin: "8px 0 0" }}>Subject: {subject}</Text>}
      </Section>

      {/* Message */}
      <Section style={{ backgroundColor: "#f8f8f8", borderRadius: "16px", padding: "20px 24px", marginBottom: "28px" }}>
        <Text style={{ fontSize: "10px", fontWeight: "800", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0 0 12px" }}>
          Message
        </Text>
        <Text style={{ fontSize: "14px", color: "#333333", lineHeight: "24px", margin: "0", whiteSpace: "pre-wrap" }}>
          {message}
        </Text>
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: "center" }}>
        <PrimaryButton href={`mailto:${email}?subject=Re: Your inquiry`} color="#7c3aed">
          Reply to {name} →
        </PrimaryButton>
      </Section>
    </BaseLayout>
  );
}
