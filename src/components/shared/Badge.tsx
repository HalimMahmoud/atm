import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  color?: "blue" | "green" | "amber" | "red" | "teal" | "gray";
}

export function Badge({ children, color = "blue" }: BadgeProps) {
  const map: Record<string, [string, string]> = {
    blue: ["#E6F1FB", "#185FA5"],
    green: ["#EAF3DE", "#3B6D11"],
    amber: ["#FAEEDA", "#854F0B"],
    red: ["#FCEBEB", "#A32D2D"],
    teal: ["#E1F5EE", "#0F6E56"],
    gray: ["#F1EFE8", "#5F5E5A"],
  };
  const [bg, text] = map[color] || map.blue;
  return (
    <span
      style={{
        background: bg,
        color: text,
        fontSize: 11,
        fontWeight: 500,
        padding: "2px 8px",
        borderRadius: 6,
      }}
    >
      {children}
    </span>
  );
}
