import { Text, Section, Link } from "@react-email/components";
import * as React from "react";
import { getShopUrl } from "../utils";
import { BaseLayout } from "../components/Layout";
import { PrimaryButton } from "../components/Button";

interface PasswordResetEmailProps {
  customerName: string;
  resetLink: string;
}

export default function PasswordResetEmail({ customerName, resetLink }: PasswordResetEmailProps) {
  const shopUrl = getShopUrl();

  return (
    <BaseLayout
      previewText="Reset your Afra Tech Point password"
      accentColor="#dc2626"
      accentLabel="Security Alert"
    >
      {/* Hero */}
      <Section style={{ textAlign: "center", marginBottom: "28px" }}>
        <Text style={{ fontSize: "28px", fontWeight: "900", color: "#000000", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Reset Your Password
        </Text>
        <Text style={{ fontSize: "15px", color: "#666666", lineHeight: "26px", margin: "0" }}>
          Hi <strong style={{ color: "#000000" }}>{customerName}</strong>, we received a request to
          reset your Afra Tech Point account password. No changes have been made yet.
        </Text>
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: "center", marginBottom: "28px" }}>
        <PrimaryButton href={resetLink} color="#dc2626">
          Reset My Password →
        </PrimaryButton>
        <Text style={{ fontSize: "12px", color: "#aaaaaa", margin: "12px 0 0" }}>
          This link expires in <strong style={{ color: "#333333" }}>1 hour</strong> for your security.
        </Text>
      </Section>

      {/* Warning box */}
      <Section style={{ backgroundColor: "#fff7ed", border: "1.5px solid #fed7aa", borderRadius: "16px", padding: "16px 20px", marginBottom: "28px" }}>
        <Text style={{ fontSize: "13px", color: "#9a3412", lineHeight: "22px", margin: "0" }}>
          <strong>Didn't request this?</strong> If you didn't ask to reset your password, please
          ignore this email. Your account remains completely secure.
        </Text>
      </Section>

      {/* Fallback link */}
      <Section style={{ backgroundColor: "#f8f8f8", borderRadius: "16px", padding: "16px 20px" }}>
        <Text style={{ fontSize: "11px", color: "#aaaaaa", margin: "0 0 6px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.15em" }}>
          Button not working? Copy this link:
        </Text>
        <Text style={{ fontSize: "12px", color: "#3b82f6", margin: "0", wordBreak: "break-all" }}>
          <Link href={resetLink} style={{ color: "#3b82f6" }}>{resetLink}</Link>
        </Text>
      </Section>
    </BaseLayout>
  );
}
