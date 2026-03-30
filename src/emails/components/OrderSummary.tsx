import { Column, Row, Section, Text, Hr } from "@react-email/components";
import * as React from "react";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  variantName?: string;
}

interface OrderSummaryProps {
  items: OrderItem[];
  total: number;
  currency?: string;
  deliveryCharge?: number;
  discount?: number;
  paymentMethod?: string;
}

export function OrderSummary({ 
  items, 
  total, 
  currency = "৳", 
  deliveryCharge = 0, 
  discount = 0, 
  paymentMethod 
}: OrderSummaryProps) {
  const subtotal = (items || []).reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);

  return (
    <Section style={wrapper}>

      {/* Header */}
      <Section style={header}>
        <Row>
          <Column>
            <Text style={headerText}>🛍️ &nbsp;Order Summary</Text>
          </Column>
          <Column align="right">
            <Text style={{ ...headerText, opacity: 0.6 }}>{(items || []).length} item{(items || []).length !== 1 ? "s" : ""}</Text>
          </Column>
        </Row>
      </Section>

      {/* Items */}
      <Section style={{ padding: "4px 24px" }}>
        {(items || []).map((item, index) => (
          <React.Fragment key={index}>
            <Row style={{ padding: "14px 0" }}>
              {/* Item number badge */}
              <Column style={{ width: "32px", paddingRight: "12px", verticalAlign: "middle" }}>
                <Text style={itemBadge}>{index + 1}</Text>
              </Column>
              {/* Name + Variant */}
              <Column style={{ verticalAlign: "middle" }}>
                <Text style={itemName}>{item.name}</Text>
                {item.variantName && (
                  <Text style={itemVariant}>{item.variantName}</Text>
                )}
                <Text style={itemQty}>
                  {item.quantity} × {currency}{Number(item.price).toFixed(2)}
                </Text>
              </Column>
              {/* Price */}
              <Column align="right" style={{ verticalAlign: "middle" }}>
                <Text style={itemTotal}>
                  {currency}{(Number(item.price) * item.quantity).toFixed(2)}
                </Text>
              </Column>
            </Row>
            {index < (items || []).length - 1 && (
              <Hr style={{ borderColor: "#f0f0f0", margin: "0" }} />
            )}
          </React.Fragment>
        ))}
      </Section>

      {/* Totals */}
      <Section style={totalsSection}>
        {/* Subtotal */}
        <Row style={{ marginBottom: "8px" }}>
          <Column>
            <Text style={totalLabel}>Subtotal</Text>
          </Column>
          <Column align="right">
            <Text style={totalValue}>{currency}{subtotal.toFixed(2)}</Text>
          </Column>
        </Row>

        {/* Discount */}
        {discount > 0 && (
          <Row style={{ marginBottom: "8px" }}>
            <Column>
              <Text style={{ ...totalLabel, color: "#4ade80" }}>Discount</Text>
            </Column>
            <Column align="right">
              <Text style={{ ...totalValue, color: "#4ade80" }}>-{currency}{discount.toFixed(2)}</Text>
            </Column>
          </Row>
        )}

        {/* Delivery Charge */}
        <Row style={{ marginBottom: "12px" }}>
          <Column>
            <Text style={totalLabel}>Delivery Charge</Text>
          </Column>
          <Column align="right">
            <Text style={totalValue}>
              {deliveryCharge > 0 ? `${currency}${deliveryCharge.toFixed(2)}` : "Free"}
            </Text>
          </Column>
        </Row>

        <Hr style={{ borderColor: "rgba(255,255,255,0.15)", margin: "0 0 12px" }} />
        
        {/* Grand Total */}
        <Row style={{ marginBottom: paymentMethod ? "12px" : "0px" }}>
          <Column>
            <Text style={grandTotalLabel}>Grand Total</Text>
          </Column>
          <Column align="right">
            <Text style={grandTotalValue}>{currency}{Number(total).toFixed(2)}</Text>
          </Column>
        </Row>

        {/* Payment Method Badge */}
        {paymentMethod && (
          <Row>
            <Column align="right">
              <Text style={paymentBadge}>
                Paid via {paymentMethod}
              </Text>
            </Column>
          </Row>
        )}
      </Section>

    </Section>
  );
}

/* ── Styles ─────────────────────────────────────────────────────────── */

const wrapper: React.CSSProperties = {
  backgroundColor: "#fafafa",
  borderRadius: "20px",
  border: "1.5px solid #eeeeee",
  overflow: "hidden",
  marginBottom: "28px",
};

const header: React.CSSProperties = {
  padding: "16px 24px",
  backgroundColor: "#111111",
};

const headerText: React.CSSProperties = {
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: "800",
  textTransform: "uppercase" as const,
  letterSpacing: "0.2em",
  margin: "0",
};

const itemBadge: React.CSSProperties = {
  width: "24px",
  height: "24px",
  backgroundColor: "#f0f0f0",
  borderRadius: "8px",
  fontSize: "10px",
  fontWeight: "800",
  color: "#888888",
  textAlign: "center" as const,
  lineHeight: "24px",
  margin: "0",
};

const itemName: React.CSSProperties = {
  fontSize: "14px",
  color: "#111111",
  margin: "0",
  fontWeight: "700",
  lineHeight: "20px",
};

const itemVariant: React.CSSProperties = {
  fontSize: "11px",
  color: "#888888",
  margin: "2px 0 0",
  fontWeight: "500",
};

const itemQty: React.CSSProperties = {
  fontSize: "12px",
  color: "#aaaaaa",
  margin: "3px 0 0",
  fontWeight: "500",
};

const itemTotal: React.CSSProperties = {
  fontSize: "14px",
  color: "#111111",
  margin: "0",
  fontWeight: "800",
};

const totalsSection: React.CSSProperties = {
  backgroundColor: "#111111",
  padding: "20px 24px",
};

const totalLabel: React.CSSProperties = {
  fontSize: "12px",
  color: "#aaaaaa",
  margin: "0",
  fontWeight: "600",
};

const totalValue: React.CSSProperties = {
  fontSize: "13px",
  color: "#ffffff",
  margin: "0",
  fontWeight: "700",
};

const grandTotalLabel: React.CSSProperties = {
  fontSize: "12px",
  color: "#cccccc",
  margin: "0",
  fontWeight: "700",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
};

const grandTotalValue: React.CSSProperties = {
  fontSize: "22px",
  color: "#ffffff",
  margin: "0",
  fontWeight: "900",
};

const paymentBadge: React.CSSProperties = {
  display: "inline-block",
  fontSize: "9px",
  fontWeight: "900",
  textTransform: "uppercase" as const,
  letterSpacing: "0.1em",
  backgroundColor: "rgba(255,255,255,0.08)",
  color: "#aaaaaa",
  borderRadius: "6px",
  padding: "4px 10px",
  margin: "0",
};
