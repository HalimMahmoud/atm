import React from "react";

interface BtnProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "danger" | "success";
  size?: "sm" | "md";
}

export function Btn({
  children,
  variant = "default",
  size = "md",
  style,
  ...props
}: BtnProps) {
  const p = size === "sm" ? "4px 10px" : "7px 16px",
    fs = size === "sm" ? 12 : 13;
  const v = {
    default: { background: "transparent", color: "var(--color-text-primary)", border: "0.5px solid var(--color-border-secondary)" },
    primary: { background: "#185FA5", color: "#fff", border: "none" },
    danger: { background: "#A32D2D", color: "#fff", border: "none" },
    success: { background: "#3B6D11", color: "#fff", border: "none" },
  };
  return (
    <button
      {...props}
      style={{
        cursor: "pointer",
        borderRadius: 8,
        fontWeight: 500,
        fontFamily: "var(--font-sans)",
        padding: p,
        fontSize: fs,
        ...v[variant],
        ...style,
      }}
    >
      {children}
    </button>
  );
}
