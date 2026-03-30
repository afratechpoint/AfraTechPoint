import { Text, Section, Link, Row, Column } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../components/Layout";
import { PrimaryButton, SecondaryButton } from "../components/Button";
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
      previewText="We received your message — we'll be in touch soon! 📨"
      accentColor="#7c3aed"
      accentLabel="Message Received"
      badgeEmoji="📩"
      logoUrl={logoUrl}
      shopUrl={shopUrl}
    >
      <Section style={{ textAlign: "center", marginBottom: "32px" }}>
        <Text style={heroEmoji}>👋</Text>
        <Text style={heroTitle}>We Got Your Message!</Text>
        <Text style={heroSub}>
          Hi <strong style={{ color: "#111111" }}>{name}</strong>, thank you for reaching out to Afra Tech Point.
          Our support team has received your inquiry and will get back to you within <strong style={{ color: "#111111" }}>24–48 hours</strong>.
        </Text>
      </Section>

      <Section style={infoBox}>
        <Text style={boxLabel}>💡 &nbsp;Quick Tip</Text>
        <Text style={boxText}>
          While you wait, feel free to browse our latest arrivals or check your order history for updates.
        </Text>
        <Row style={{ marginTop: "16px" }}>
          <Column align="center">
            <SecondaryButton href={shopUrl} color="#7c3aed">Browse Shop</SecondaryButton>
          </Column>
          <Column align="center">
            <SecondaryButton href={`${shopUrl}/account`} color="#7c3aed">My Account</SecondaryButton>
          </Column>
        </Row>
      </Section>

      <Section style={{ textAlign: "center" }}>
        <PrimaryButton href={shopUrl} color="#7c3aed">
          Visit Afra Tech Point →
        </PrimaryButton>
        <Text style={ctaNote}>
          Typical response time: Under 24 hours.
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
      previewText={`📬 New Inquiry from ${name}`}
      accentColor="#7c3aed"
      accentLabel="New Customer Inquiry"
      badgeEmoji="🔔"
      logoUrl={logoUrl}
      shopUrl={shopUrl}
    >
      <Section style={{ textAlign: "center", marginBottom: "32px" }}>
        <Text style={heroTitle}>New Inquiry Received</Text>
        <Text style={heroSub}>A customer has sent a message via the contact form.</Text>
      </Section>

      {/* Sender Details */}
      <Section style={detailsBox}>
        <Text style={boxLabel}>👤 &nbsp;Sender</Text>
        <Text style={senderName}>{name}</Text>
        <Text style={senderEmail}>{email}</Text>
        {subject && <Text style={senderSubject}>Subject: {subject}</Text>}
      </Section>

      {/* Message */}
      <Section style={messageBox}>
        <Text style={boxLabel}>💬 &nbsp;Message</Text>
        <Text style={messageText}>
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

/* ── Styles ──────────────────────────────────────────────────────────── */
const heroEmoji: React.CSSProperties   = { fontSize: "48px", margin: "0 0 8px", textAlign: "center" };
const heroTitle: React.CSSProperties   = { fontSize: "32px", fontWeight: "900", color: "#111111", margin: "0 0 14px", letterSpacing: "-0.03em", lineHeight: "1.2" };
const heroSub: React.CSSProperties     = { fontSize: "15px", color: "#555555", lineHeight: "26px", margin: "0" };

const infoBox: React.CSSProperties     = { backgroundColor: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: "20px", padding: "24px", marginBottom: "32px" };
const detailsBox: React.CSSProperties  = { backgroundColor: "#f8f8f8", borderRadius: "20px", padding: "24px", marginBottom: "16px" };
const messageBox: React.CSSProperties  = { backgroundColor: "#f8f8f8", borderRadius: "20px", padding: "24px", marginBottom: "32px" };

const boxLabel: React.CSSProperties    = { fontSize: "10px", fontWeight: "800", color: "#aaaaaa", textTransform: "uppercase" as const, letterSpacing: "0.2em", margin: "0 0 12px" };
const boxText: React.CSSProperties     = { fontSize: "13px", color: "#5b21b6", lineHeight: "22px", margin: "0", textAlign: "center" };

const senderName: React.CSSProperties  = { fontSize: "16px", fontWeight: "800", color: "#111111", margin: "0 0 4px" };
const senderEmail: React.CSSProperties = { fontSize: "13px", color: "#666666", margin: "0" };
const senderSubject: React.CSSProperties = { fontSize: "13px", color: "#888888", fontWeight: "600", marginTop: "8px" };

const messageText: React.CSSProperties = { fontSize: "14px", color: "#333333", lineHeight: "24px", margin: "0", whiteSpace: "pre-wrap" };
const ctaNote: React.CSSProperties     = { fontSize: "12px", color: "#aaaaaa", margin: "16px 0 0" };
