import React from "react";

interface CardProps {
  children: React.ReactNode;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({ children, style, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--color-background-primary)",
        border: "0.5px solid var(--color-border-tertiary)",
        borderRadius: 12,
        padding: "1rem 1.25rem",
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
