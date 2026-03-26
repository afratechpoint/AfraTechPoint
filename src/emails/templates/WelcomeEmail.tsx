import { Text, Section, Row, Column, Link } from "@react-email/components";
import * as React from "react";
import { BaseLayout } from "../components/Layout";
import { PrimaryButton } from "../components/Button";

interface WelcomeEmailProps {
  customerName: string;
}

export default function WelcomeEmail({ customerName }: WelcomeEmailProps) {
  const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || "http://localhost:3000";

  const perks = [
    { title: "Express Checkout", sub: "Save addresses & pay faster" },
    { title: "Live Tracking", sub: "Follow every step of delivery" },
    { title: "Exclusive Deals", sub: "Members-only early access" },
  ];

  return (
    <BaseLayout
      previewText={`Welcome to Afra Tech Point, ${customerName}!`}
      accentColor="#000000"
      accentLabel="Welcome to the Family"
    >
      {/* Hero */}
      <Section style={{ textAlign: "center", marginBottom: "32px" }}>
        <Text style={{ fontSize: "36px", fontWeight: "900", color: "#000000", margin: "0 0 12px", letterSpacing: "-0.03em", lineHeight: "1.1" }}>
          Welcome aboard,<br />{customerName}!
        </Text>
        <Text style={{ fontSize: "16px", color: "#555555", lineHeight: "26px", margin: "0" }}>
          Your Afra Tech Point account is ready. Explore our premium catalog of the latest electronics and smart devices.
        </Text>
      </Section>

      {/* Perks */}
      <Section style={{ backgroundColor: "#f8f8f8", borderRadius: "20px", padding: "28px", marginBottom: "32px" }}>
        <Text style={{ fontSize: "10px", fontWeight: "800", color: "#aaaaaa", textTransform: "uppercase", letterSpacing: "0.25em", textAlign: "center", margin: "0 0 20px" }}>
          What You Get
        </Text>
        <Row>
          {perks.map((p) => (
            <Column key={p.title} style={{ padding: "0 8px", textAlign: "center" }}>
              <Text style={{ fontSize: "13px", fontWeight: "800", color: "#000000", margin: "0 0 2px" }}>{p.title}</Text>
              <Text style={{ fontSize: "11px", color: "#888888", margin: "0", lineHeight: "16px" }}>{p.sub}</Text>
            </Column>
          ))}
        </Row>
      </Section>

      {/* CTA */}
      <Section style={{ textAlign: "center", marginBottom: "8px" }}>
        <PrimaryButton href={shopUrl}>
          Start Shopping →
        </PrimaryButton>
        <Text style={{ fontSize: "12px", color: "#aaaaaa", margin: "16px 0 0" }}>
          Questions?{" "}
          <Link href={`${shopUrl}/contact`} style={{ color: "#000000", fontWeight: "700" }}>
            Contact our support team
          </Link>
        </Text>
      </Section>
    </BaseLayout>
  );
}
