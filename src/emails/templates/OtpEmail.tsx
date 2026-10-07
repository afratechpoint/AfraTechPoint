import { Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import { getShopUrl } from "../utils";
import { BaseLayout } from "../components/Layout";

const heroEmoji: React.CSSProperties = {
  fontSize: "48px",
  margin: "0 0 8px",
  textAlign: "center",
};

const heroTitle: React.CSSProperties = {
  fontSize: "30px",
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

const otpContainer: React.CSSProperties = {
  backgroundColor: "#f4f6f9",
  borderRadius: "16px",
  border: "2px dashed #6366f1",
  padding: "24px",
  textAlign: "center",
  margin: "28px 0",
};

const otpCodeStyle: React.CSSProperties = {
  fontSize: "38px",
  fontWeight: "900",
  letterSpacing: "12px",
  color: "#4f46e5",
  fontFamily: "monospace",
  margin: "0",
};

const warningBox: React.CSSProperties = {
  backgroundColor: "#fffbeb",
  border: "1.5px solid #fde68a",
  borderRadius: "12px",
  padding: "16px 20px",
  marginTop: "20px",
};

const warningText: React.CSSProperties = {
  fontSize: "13px",
  color: "#92400e",
  lineHeight: "20px",
  margin: "0",
};

interface OtpEmailProps {
  customerName?: string;
  otp: string;
  actionType: "login" | "register";
  logoUrl?: string;
  shopUrl?: string;
}

export default function OtpEmail({
  customerName = "Customer",
  otp,
  actionType,
  logoUrl,
  shopUrl: propShop,
}: OtpEmailProps) {
  const shopUrl = propShop || getShopUrl();
  const finalLogoUrl = logoUrl || "/email-logo.png";
  const actionText = actionType === "register" ? "Account Registration" : "Account Login";

  return (
    <BaseLayout
      previewText={`Your ${actionText} Code: ${otp} — Afra Tech Point`}
      accentColor="#6366f1"
      accentLabel="Security Verification"
      badgeEmoji="🔐"
      logoUrl={finalLogoUrl}
      shopUrl={shopUrl}
    >
      {/* Hero */}
      <Section style={{ textAlign: "center", marginBottom: "20px" }}>
        <Text style={heroEmoji}>🔐</Text>
        <Text style={heroTitle}>
          {actionType === "register" ? "Verify Your Account" : "Login Verification"}
        </Text>
        <Text style={heroSub}>
          Hi <strong style={{ color: "#111111" }}>{customerName}</strong>, use the verification code below to complete your {actionText.toLowerCase()}.
        </Text>
      </Section>

      {/* OTP Display Box */}
      <Section style={otpContainer}>
        <Text style={{ fontSize: "12px", textTransform: "uppercase", letterSpacing: "2px", color: "#6b7280", margin: "0 0 8px", fontWeight: "700" }}>
          ONE-TIME PASSWORD (OTP)
        </Text>
        <Text style={otpCodeStyle}>{otp}</Text>
        <Text style={{ fontSize: "12px", color: "#9ca3af", margin: "8px 0 0" }}>
          Valid for 10 minutes
        </Text>
      </Section>

      {/* Security notice */}
      <Section style={warningBox}>
        <Text style={warningText}>
          ⚠️ <strong>Security Notice:</strong> Never share this OTP with anyone, including Afra Tech Point support. If you did not request this code, please ignore this email.
        </Text>
      </Section>
    </BaseLayout>
  );
}
