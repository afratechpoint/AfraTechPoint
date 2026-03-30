import { Text, Section, Row, Column, Link } from "@react-email/components";
import * as React from "react";
import { getShopUrl } from "../utils";
import { BaseLayout } from "../components/Layout";
import { PrimaryButton } from "../components/Button";

interface WelcomeEmailProps {
  customerName: string;
  logoUrl?: string;
  shopUrl?: string;
}

export default function WelcomeEmail({ customerName, logoUrl, shopUrl: propShop }: WelcomeEmailProps) {
  const shopUrl = propShop || getShopUrl();

  const perks = [
    { emoji: "⚡", title: "Express Checkout", sub: "Save addresses & pay faster on future orders" },
    { emoji: "📦", title: "Live Order Tracking", sub: "Follow every step from dispatch to delivery" },
    { emoji: "🎁", title: "Exclusive Deals", sub: "Members-only discounts & early access to sales" },
  ];

  return (
    <BaseLayout
      previewText={`Welcome to Afra Tech Point, ${customerName}! 🎉`}
      accentColor="#111111"
      accentLabel="Welcome to the Family"
      badgeEmoji="🎉"
      logoUrl={logoUrl}
      shopUrl={shopUrl}
    >
      {/* Hero */}
      <Section style={{ textAlign: "center", marginBottom: "36px" }}>
        <Text style={heroTitle}>
          Welcome aboard,<br />{customerName}! 👋
        </Text>
        <Text style={heroSubtitle}>
          Your Afra Tech Point account is ready. You now have access to our premium catalog
          of the latest electronics, smart devices, and much more.
        </Text>
      </Section>

      {/* Divider label */}
      <Text style={sectionLabel}>YOUR ACCOUNT PERKS</Text>

      {/* Perks */}
      <Section style={{ marginBottom: "36px" }}>
        {perks.map((p) => (
          <Row key={p.title} style={perkRow}>
            <Column style={{ width: "48px", verticalAlign: "middle" }}>
              <Text style={perkEmoji}>{p.emoji}</Text>
            </Column>
            <Column style={{ verticalAlign: "middle" }}>
              <Text style={perkTitle}>{p.title}</Text>
              <Text style={perkSub}>{p.sub}</Text>
            </Column>
          </Row>
        ))}
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: "center" }}>
        <PrimaryButton href={shopUrl} color="#111111">
          Explore the Store →
        </PrimaryButton>
        <Text style={ctaNote}>
          Questions?{" "}
          <Link href={`${shopUrl}/contact`} style={ctaLink}>
            Contact our support team
          </Link>
        </Text>
      </Section>
    </BaseLayout>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────── */
const heroTitle: React.CSSProperties = {
  fontSize: "34px",
  fontWeight: "900",
  color: "#111111",
  margin: "0 0 16px",
  letterSpacing: "-0.03em",
  lineHeight: "1.15",
};

const heroSubtitle: React.CSSProperties = {
  fontSize: "15px",
  color: "#555555",
  lineHeight: "26px",
  margin: "0",
};

const sectionLabel: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: "800",
  color: "#bbbbbb",
  letterSpacing: "0.25em",
  margin: "0 0 16px",
};

const perkRow: React.CSSProperties = {
  backgroundColor: "#f7f7f7",
  borderRadius: "14px",
  padding: "16px 16px",
  marginBottom: "10px",
};

const perkEmoji: React.CSSProperties = {
  fontSize: "24px",
  margin: "0",
  lineHeight: "1",
};

const perkTitle: React.CSSProperties = {
  fontSize: "14px",
  fontWeight: "800",
  color: "#111111",
  margin: "0 0 3px",
};

const perkSub: React.CSSProperties = {
  fontSize: "12px",
  color: "#888888",
  margin: "0",
  lineHeight: "18px",
};

const ctaNote: React.CSSProperties = {
  fontSize: "12px",
  color: "#aaaaaa",
  margin: "16px 0 0",
};

const ctaLink: React.CSSProperties = {
  color: "#111111",
  fontWeight: "700",
};
