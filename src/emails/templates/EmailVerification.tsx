import * as React from "react";
import { getShopUrl } from "../utils";
import { Body, Container, Head, Html, Img, Link, Preview, Section, Text, Hr } from "@react-email/components";

interface EmailVerificationEmailProps {
  customerName: string;
  verificationLink: string;
  logoUrl?: string;
  shopUrl?: string;
}

const baseUrl = getShopUrl();

export default function EmailVerificationEmail({
  customerName,
  verificationLink,
  logoUrl,
  shopUrl
}: EmailVerificationEmailProps) {
  const finalShopUrl = shopUrl || getShopUrl();
  const finalLogoUrl = logoUrl || `${finalShopUrl}/logo.png`;
  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      <Preview>Activate your Afra Tech Point account</Preview>
      <Body style={{ backgroundColor: "#f0f0f0", fontFamily: "'Helvetica Neue',Helvetica,Arial,sans-serif", margin: "0", padding: "0" }}>
        <Container style={{ maxWidth: "600px", margin: "40px auto", padding: "0 20px" }}>

          {/* Badge */}
          <Section style={{ textAlign: "center", marginBottom: "12px" }}>
            <Text style={{ display: "inline-block", backgroundColor: "#0ea5e9", color: "#ffffff", fontSize: "9px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.25em", padding: "5px 16px", borderRadius: "100px", margin: "0" }}>
              Account Activation
            </Text>
          </Section>

          {/* Card */}
          <Section style={{ backgroundColor: "#ffffff", borderRadius: "28px", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.10)" }}>

            {/* Header */}
            <Section style={{ backgroundColor: "#0ea5e9", padding: "36px 40px", textAlign: "center" }}>
              <Img src={finalLogoUrl} width="130" alt="Afra Tech Point" style={{ display: "block", margin: "0 auto" }} />
            </Section>

            {/* Body */}
            <Section style={{ padding: "40px" }}>
              <Text style={{ fontSize: "28px", fontWeight: "900", color: "#000000", textAlign: "center", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
                Verify Your Email
              </Text>
              <Text style={{ fontSize: "15px", color: "#666666", lineHeight: "26px", textAlign: "center", margin: "0 0 28px" }}>
                Hi <strong style={{ color: "#000000" }}>{customerName}</strong>, you're almost ready!<br />
                Click the button below to activate your Afra Tech Point account.
              </Text>

              {/* CTA Button */}
              <Section style={{ textAlign: "center", marginBottom: "28px" }}>
                <a
                  href={verificationLink}
                  style={{
                    backgroundColor: "#0ea5e9",
                    color: "#ffffff",
                    borderRadius: "14px",
                    fontWeight: "800",
                    fontSize: "14px",
                    padding: "14px 32px",
                    textDecoration: "none",
                    display: "inline-block",
                    letterSpacing: "0.02em",
                  }}
                >
                  Activate My Account →
                </a>
                <Text style={{ fontSize: "12px", color: "#aaaaaa", margin: "12px 0 0", textAlign: "center" }}>
                  This link expires in <strong style={{ color: "#333333" }}>1 hour</strong>.
                </Text>
              </Section>

              {/* Security note */}
              <Section style={{ backgroundColor: "#f0f9ff", border: "1.5px solid #bae6fd", borderRadius: "16px", padding: "16px 20px", marginBottom: "20px" }}>
                <Text style={{ fontSize: "13px", color: "#075985", lineHeight: "22px", margin: "0" }}>
                  <strong>Didn't create this account?</strong> You can safely ignore this email. No account will be activated without clicking the link above.
                </Text>
              </Section>

              {/* Fallback link */}
              <Section style={{ backgroundColor: "#f8f8f8", borderRadius: "16px", padding: "16px 20px" }}>
                <Text style={{ fontSize: "11px", color: "#aaaaaa", margin: "0 0 6px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.15em" }}>
                  Button not working? Copy this link:
                </Text>
                <Text style={{ fontSize: "12px", color: "#0ea5e9", margin: "0", wordBreak: "break-all" }}>
                  <Link href={verificationLink} style={{ color: "#0ea5e9" }}>{verificationLink}</Link>
                </Text>
              </Section>
            </Section>

            {/* Footer */}
            <Hr style={{ borderColor: "#f0f0f0", margin: "0" }} />
            <Section style={{ padding: "24px 40px", backgroundColor: "#fafafa", textAlign: "center" }}>
              <Text style={{ fontSize: "12px", color: "#aaaaaa", margin: "0", lineHeight: "20px" }}>
                © {new Date().getFullYear()} Afra Tech Point. All rights reserved.<br />
                <Link href={finalShopUrl} style={{ color: "#000000", fontWeight: "700", textDecoration: "none" }}>Visit Afra Tech Point →</Link>
              </Text>
            </Section>
          </Section>

          <Section style={{ textAlign: "center", marginTop: "20px" }}>
            <Text style={{ fontSize: "11px", color: "#cccccc", margin: "0" }}>
              Afra Tech Point · Dhaka, Bangladesh
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
