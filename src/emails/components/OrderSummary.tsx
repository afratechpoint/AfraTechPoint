import { Column, Row, Section, Text, Hr } from "@react-email/components";
import * as React from "react";

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
}

interface OrderSummaryProps {
  items: OrderItem[];
  total: number;
  currency?: string;
}

export function OrderSummary({ items, total, currency = "৳" }: OrderSummaryProps) {
  return (
    <Section style={{ backgroundColor: "#fafafa", borderRadius: "20px", border: "1.5px solid #eeeeee", padding: "0", marginBottom: "24px", overflow: "hidden" }}>

      {/* Header */}
      <Section style={{ padding: "16px 24px", backgroundColor: "#000000" }}>
        <Text style={{ color: "#ffffff", fontSize: "11px", fontWeight: "800", textTransform: "uppercase", letterSpacing: "0.2em", margin: "0" }}>
          Order Summary
        </Text>
      </Section>

      {/* Items */}
      <Section style={{ padding: "8px 24px" }}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            <Row style={{ padding: "12px 0" }}>
              <Column>
                <Text style={{ fontSize: "14px", color: "#111111", margin: "0", fontWeight: "700", lineHeight: "20px" }}>
                  {item.name}
                </Text>
                <Text style={{ fontSize: "12px", color: "#888888", margin: "4px 0 0", fontWeight: "500" }}>
                  Qty {item.quantity} × {currency}{item.price.toFixed(2)}
                </Text>
              </Column>
              <Column align="right">
                <Text style={{ fontSize: "15px", color: "#000000", margin: "0", fontWeight: "800" }}>
                  {currency}{(item.price * item.quantity).toFixed(2)}
                </Text>
              </Column>
            </Row>
            {index < items.length - 1 && <Hr style={{ borderColor: "#eeeeee", margin: "0" }} />}
          </React.Fragment>
        ))}
      </Section>

      {/* Total Row */}
      <Section style={{ backgroundColor: "#000000", padding: "16px 24px" }}>
        <Row>
          <Column>
            <Text style={{ fontSize: "11px", color: "#aaaaaa", margin: "0", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.15em" }}>
              Total Amount
            </Text>
          </Column>
          <Column align="right">
            <Text style={{ fontSize: "20px", color: "#ffffff", margin: "0", fontWeight: "900" }}>
              {currency}{Number(total).toFixed(2)}
            </Text>
          </Column>
        </Row>
      </Section>

    </Section>
  );
}
