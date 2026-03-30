import { Text, Section, Link } from "@react-email/components";
import * as React from "react";
import { getShopUrl } from "../utils";
import { BaseLayout } from "../components/Layout";
import { PrimaryButton } from "../components/Button";

interface PasswordResetEmailProps {
  customerName: string;
  resetLink: string;
  logoUrl?: string;
  shopUrl?: string;
}

export default function PasswordResetEmail({ customerName, resetLink, logoUrl, shopUrl: propShop }: PasswordResetEmailProps) {
  const shopUrl = propShop || getShopUrl();

  return (
    <BaseLayout
      previewText="Reset your Afra Tech Point password 🔐"
      accentColor="#dc2626"
      accentLabel="Security Alert"
      badgeEmoji="🔐"
      logoUrl={logoUrl}
      shopUrl={shopUrl}
    >
      {/* Hero */}
      <Section style={{ textAlign: "center", marginBottom: "32px" }}>
        <Text style={heroEmoji}>🛡️</Text>
        <Text style={heroTitle}>Reset Your Password</Text>
        <Text style={heroSub}>
          Hi <strong style={{ color: "#111111" }}>{customerName}</strong>, we received a request to
          reset your Afra Tech Point account password. No changes have been made yet.
        </Text>
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: "center", marginBottom: "32px" }}>
        <PrimaryButton href={resetLink} color="#dc2626">
          Reset My Password →
        </PrimaryButton>
        <Text style={ctaNote}>
          This link expires in <strong style={{ color: "#333333" }}>1 hour</strong> for your security.
        </Text>
      </Section>

      {/* Warning box */}
      <Section style={warningBox}>
        <Text style={warningText}>
          <strong>Didn't request this?</strong> If you didn't ask to reset your password, please
          ignore this email. Your account remains completely secure.
        </Text>
      </Section>

      {/* Fallback link */}
      <Section style={fallbackBox}>
        <Text style={fallbackLabel}>
          Button not working? Copy this link:
        </Text>
        <Text style={fallbackValue}>
          <Link href={resetLink} style={{ color: "#3b82f6" }}>{resetLink}</Link>
        </Text>
      </Section>
    </BaseLayout>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────── */
const heroEmoji: React.CSSProperties   = { fontSize: "48px", margin: "0 0 8px", textAlign: "center" };
const heroTitle: React.CSSProperties   = { fontSize: "32px", fontWeight: "900", color: "#111111", margin: "0 0 14px", letterSpacing: "-0.03em" };
const heroSub: React.CSSProperties     = { fontSize: "15px", color: "#555555", lineHeight: "26px", margin: "0" };

const warningBox: React.CSSProperties  = { backgroundColor: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: "16px", padding: "20px 24px", marginBottom: "28px" };
const warningText: React.CSSProperties = { fontSize: "14px", color: "#9a3412", lineHeight: "22px", margin: "0" };

const fallbackBox: React.CSSProperties = { backgroundColor: "#f8f8f8", borderRadius: "16px", padding: "16px 20px" };
const fallbackLabel: React.CSSProperties = { fontSize: "11px", color: "#aaaaaa", margin: "0 0 6px", fontWeight: "700", textTransform: "uppercase" as const, letterSpacing: "0.15em" };
const fallbackValue: React.CSSProperties = { fontSize: "12px", color: "#3b82f6", margin: "0", wordBreak: "break-all" };

const ctaNote: React.CSSProperties     = { fontSize: "12px", color: "#aaaaaa", margin: "16px 0 0" };
