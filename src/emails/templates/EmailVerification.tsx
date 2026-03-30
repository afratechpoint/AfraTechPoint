import { Text, Section, Link, Row, Column } from "@react-email/components";
import * as React from "react";
import { getShopUrl } from "../utils";
import { BaseLayout } from "../components/Layout";
import { PrimaryButton } from "../components/Button";

/* ── Styles (সব কম্পোনেন্টের আগে) ───────────────────────────────────── */
const heroEmoji: React.CSSProperties = {
  fontSize: "48px",
  margin: "0 0 8px",
  textAlign: "center",
};

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

const infoBox: React.CSSProperties = {
  backgroundColor: "#eff6ff",
  border: "1.5px solid #bfdbfe",
  borderRadius: "16px",
  padding: "20px 24px",
  marginBottom: "28px",
};

const infoText: React.CSSProperties = {
  fontSize: "14px",
  color: "#1e3a8a",
  lineHeight: "22px",
  margin: "0",
};

const fallbackBox: React.CSSProperties = {
  backgroundColor: "#f8f8f8",
  borderRadius: "16px",
  padding: "16px 20px",
};

const fallbackLabel: React.CSSProperties = {
  fontSize: "11px",
  color: "#aaaaaa",
  margin: "0 0 6px",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "0.15em",
};

const fallbackValue: React.CSSProperties = {
  fontSize: "12px",
  color: "#3b82f6",
  margin: "0",
  wordBreak: "break-all",
};

const ctaNote: React.CSSProperties = {
  fontSize: "12px",
  color: "#aaaaaa",
  margin: "16px 0 0",
};

/* ── Component ──────────────────────────────────────────────────────── */
interface EmailVerificationProps {
  customerName: string;
  verificationLink: string;
  logoUrl?: string;
  shopUrl?: string;
}

export default function EmailVerification({
  customerName,
  verificationLink,
  logoUrl,
  shopUrl: propShop,
}: EmailVerificationProps) {
  const shopUrl = propShop || getShopUrl();

  // ডিফল্ট লোগো URL (আপনার আগের দেওয়া)
  const finalLogoUrl = logoUrl || "https://i.ibb.co.com/TqvmBZyc/logo-wbg.png";

  return (
    <BaseLayout
      previewText="Verify your email address — Afra Tech Point ✉️"
      accentColor="#3b82f6"
      accentLabel="Support Service"
      badgeEmoji="✉️"
      logoUrl={finalLogoUrl}
      shopUrl={shopUrl}
    >
      {/* Hero */}
      <Section style={{ textAlign: "center", marginBottom: "32px" }}>
        <Text style={heroEmoji}>📬</Text>
        <Text style={heroTitle}>Verify Your Email</Text>
        <Text style={heroSub}>
          Hi <strong style={{ color: "#111111" }}>{customerName}</strong>,
          thank you for joining Afra Tech Point! Please verify your email
          address to complete your account setup.
        </Text>
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: "center", marginBottom: "32px" }}>
        <PrimaryButton href={verificationLink} color="#3b82f6">
          Verify Email Address →
        </PrimaryButton>
        <Text style={ctaNote}>
          This link will expire in{" "}
          <strong style={{ color: "#333333" }}>24 hours</strong>.
        </Text>
      </Section>

      {/* Info Box */}
      <Section style={infoBox}>
        <Text style={infoText}>
          <strong>Why verify?</strong> Verification ensures that you can
          securely access your account, receive order updates, and recover your
          password if needed.
        </Text>
      </Section>

      {/* Fallback link */}
      <Section style={fallbackBox}>
        <Text style={fallbackLabel}>Button not working? Copy this link:</Text>
        <Text style={fallbackValue}>
          <Link href={verificationLink} style={{ color: "#3b82f6" }}>
            {verificationLink}
          </Link>
        </Text>
      </Section>
    </BaseLayout>
  );
}