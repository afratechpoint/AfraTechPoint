import { Body, Container, Head, Html, Img, Link, Preview, Section, Tailwind, Text, Hr } from "@react-email/components";
import * as React from "react";

interface LayoutProps {
  children: React.ReactNode;
  previewText?: string;
  accentColor?: string;    // e.g. "#000000"
  accentLabel?: string;    // e.g. "ORDER UPDATE"
}

export function BaseLayout({ children, previewText, accentColor = "#000000", accentLabel }: LayoutProps) {
  const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || "http://localhost:3000";
  const logoUrl = process.env.NEXT_PUBLIC_SHOP_LOGO_URL || `${shopUrl}/logo.png`;
  const shopName = "Afra Tech Point";

  return (
    <Html>
      <Head>
        <meta name="color-scheme" content="light" />
        <meta name="supported-color-schemes" content="light" />
      </Head>
      {previewText && <Preview>{previewText}</Preview>}
      <Tailwind>
        <Body className="bg-[#f0f0f0] font-sans my-auto mx-auto">
          <Container className="my-[40px] mx-auto max-w-[600px]">

            {/* ── Top Badge ──────────────────────────────────── */}
            {accentLabel && (
              <Section className="text-center mb-3">
                <Text
                  className="inline-block text-[9px] font-black uppercase tracking-[0.25em] px-4 py-1.5 rounded-full m-0"
                  style={{ backgroundColor: accentColor, color: "#ffffff" }}
                >
                  {accentLabel}
                </Text>
              </Section>
            )}

            {/* ── Main Card ──────────────────────────────────── */}
            <Section className="bg-white rounded-[28px] overflow-hidden shadow-lg" style={{ boxShadow: "0 8px 40px rgba(0,0,0,0.10)" }}>

              {/* Header */}
              <Section className="px-10 pt-10 pb-8 text-center" style={{ backgroundColor: accentColor }}>
                <Img src={logoUrl} width="130" alt={shopName} className="mx-auto block" />
              </Section>

              {/* Content */}
              <Section className="px-10 py-10">
                {children}
              </Section>

              {/* Divider */}
              <Hr className="border-[#f0f0f0] mx-0 my-0" />

              {/* Footer */}
              <Section className="px-10 py-8 text-center bg-[#fafafa]">
                <Text className="text-[12px] text-[#aaaaaa] m-0 leading-[20px] font-medium">
                  © {new Date().getFullYear()} {shopName}. All rights reserved.
                </Text>
                <Text className="text-[12px] m-0 mt-1">
                  <Link href={shopUrl} className="text-[#000000] font-bold no-underline">
                    Visit {shopName} →
                  </Link>
                </Text>
              </Section>
            </Section>

            {/* Bottom note */}
            <Section className="text-center mt-6">
              <Text className="text-[11px] text-[#bbbbbb] m-0">
                This email was sent by {shopName} · Dhaka, Bangladesh
              </Text>
            </Section>

          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
