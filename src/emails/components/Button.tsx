import { Button as ReactEmailButton } from "@react-email/components";
import * as React from "react";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  color?: string;
  textColor?: string;
  fullWidth?: boolean;
}

export function PrimaryButton({ href, children, color = "#111111", textColor = "#ffffff", fullWidth = false }: ButtonProps) {
  return (
    <ReactEmailButton
      href={href}
      style={{
        backgroundColor: color,
        color: textColor,
        borderRadius: "14px",
        fontWeight: "800",
        fontSize: "14px",
        padding: "15px 36px",
        textDecoration: "none",
        display: "inline-block",
        textAlign: "center",
        letterSpacing: "0.03em",
        boxShadow: `0 4px 14px 0 ${color}55`,
        ...(fullWidth ? { width: "100%" } : {}),
      }}
    >
      {children}
    </ReactEmailButton>
  );
}

export function SecondaryButton({ href, children, color = "#111111" }: Omit<ButtonProps, "textColor" | "fullWidth">) {
  return (
    <ReactEmailButton
      href={href}
      style={{
        backgroundColor: "transparent",
        color: color,
        border: `2px solid ${color}22`,
        borderRadius: "12px",
        fontWeight: "700",
        fontSize: "13px",
        padding: "12px 28px",
        textDecoration: "none",
        display: "inline-block",
        textAlign: "center",
        letterSpacing: "0.02em",
      }}
    >
      {children}
    </ReactEmailButton>
  );
}
