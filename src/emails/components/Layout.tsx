import {
  Body, Container, Head, Html, Img, Link,
  Preview, Section, Text, Hr, Row, Column
} from "@react-email/components";
import * as React from "react";
import { getShopUrl } from "../utils";

interface LayoutProps {
  children: React.ReactNode;
  previewText?: string;
  accentColor?: string;
  accentLabel?: string;
  badgeEmoji?: string;
  logoUrl?: string;
  shopUrl?: string;
}

export function BaseLayout({
  children,
  previewText,
  accentColor = "#111111",
  accentLabel,
  badgeEmoji = "📦",
  logoUrl: propLogo,
  shopUrl: propShop,
}: LayoutProps) {
  const shopUrl  = propShop  || getShopUrl();
  // Prefer prop > env > self-hosted fallback (deployed to /email-logo.png)
  const HOSTED_LOGO = `${shopUrl}/email-logo.png`;
  const logoUrl = propLogo || process.env.NEXT_PUBLIC_SHOP_LOGO_URL || HOSTED_LOGO;
  const shopName = "Afra Tech Point";
  const year     = new Date().getFullYear();

  return (
    <Html lang="en" dir="ltr">
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
        <meta charSet="utf-8" />
      </Head>
      {previewText && <Preview>{previewText}</Preview>}

      <Body style={body}>
        <Container style={container}>

          {/* ── Top Badge ─────────────────────────────────────────── */}
          {accentLabel && (
            <Section style={{ textAlign: "center", marginBottom: "20px" }}>
              <Text
                style={{
                  display: "inline-block",
                  fontSize: "11px",
                  fontWeight: "800",
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.18em",
                  color: "#ffffff",
                  backgroundColor: accentColor,
                  borderRadius: "100px",
                  padding: "6px 18px",
                  margin: "0",
                }}
              >
                {badgeEmoji} &nbsp;{accentLabel}
              </Text>
            </Section>
          )}

          {/* ── Card ──────────────────────────────────────────────── */}
          <Section style={card}>

            {/* Header — Logo on accent bg */}
            <Section style={{ ...cardHeader, backgroundColor: accentColor }}>
              {/* Decorative pattern overlay */}
              <div style={{
                position: "absolute" as const,
                top: 0, left: 0, right: 0, bottom: 0,
                backgroundImage: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 60%)",
                pointerEvents: "none" as const,
              }} />
              <Img
                src={logoUrl}
                width="160"
                height="56"
                alt={shopName}
                style={{ display: "block", margin: "0 auto", objectFit: "contain", objectPosition: "center" }}
              />
            </Section>

            {/* Content */}
            <Section style={cardBody}>
              {children}
            </Section>

            {/* Footer */}
            <Hr style={{ borderColor: "#f0f0f0", margin: "0" }} />
            <Section style={cardFooter}>
              <Row>
                <Column align="center">
                  <Text style={footerText}>
                    © {year}&nbsp;{shopName} · Dhaka, Bangladesh
                  </Text>
                  <Text style={{ ...footerText, marginTop: "4px" }}>
                    <Link href={shopUrl} style={footerLink}>Visit our store</Link>
                    &nbsp;·&nbsp;
                    <Link href={`${shopUrl}/contact`} style={footerLink}>Contact support</Link>
                  </Text>
                  <Text style={{ ...footerText, marginTop: "8px", color: "#cccccc", fontSize: "10px" }}>
                    You received this email because you have an account at {shopName}.
                  </Text>
                </Column>
              </Row>
            </Section>

          </Section>
          {/* End Card */}

        </Container>
      </Body>
    </Html>
  );
}

/* ── Styles ──────────────────────────────────────────────────────────── */

const body: React.CSSProperties = {
  backgroundColor: "#eef0f3",
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  margin: "0",
  padding: "32px 16px",
};

const container: React.CSSProperties = {
  maxWidth: "600px",
  margin: "0 auto",
};

const card: React.CSSProperties = {
  backgroundColor: "#ffffff",
  borderRadius: "24px",
  overflow: "hidden",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.07), 0 20px 48px -8px rgba(0,0,0,0.12)",
};

const cardHeader: React.CSSProperties = {
  padding: "36px 40px",
  textAlign: "center",
  position: "relative",
};

const cardBody: React.CSSProperties = {
  padding: "40px 44px",
};

const cardFooter: React.CSSProperties = {
  padding: "24px 40px 28px",
  backgroundColor: "#fafafa",
  textAlign: "center",
};

const footerText: React.CSSProperties = {
  fontSize: "12px",
  color: "#999999",
  margin: "0",
  lineHeight: "20px",
};

const footerLink: React.CSSProperties = {
  color: "#666666",
  textDecoration: "none",
  fontWeight: "600",
};
