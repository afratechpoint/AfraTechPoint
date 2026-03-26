import { Button as ReactEmailButton } from "@react-email/components";
import * as React from "react";

interface ButtonProps {
  href: string;
  children: React.ReactNode;
  color?: string;
  textColor?: string;
}

export function PrimaryButton({ href, children, color = "#000000", textColor = "#ffffff" }: ButtonProps) {
  return (
    <ReactEmailButton
      href={href}
      style={{
        backgroundColor: color,
        color: textColor,
        borderRadius: "14px",
        fontWeight: "800",
        fontSize: "14px",
        padding: "14px 32px",
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
