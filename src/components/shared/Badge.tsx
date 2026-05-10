import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps {
  children: React.ReactNode;
  color?: "blue" | "green" | "amber" | "red" | "teal" | "gray";
  className?: string;
}

export function Badge({ children, color = "blue", className }: BadgeProps) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700 border-blue-100",
    green: "bg-green-50 text-green-700 border-green-100",
    amber: "bg-amber-50 text-amber-700 border-amber-100",
    red: "bg-red-50 text-red-700 border-red-100",
    teal: "bg-teal-50 text-teal-700 border-teal-100",
    gray: "bg-slate-50 text-slate-600 border-slate-100",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
        colorMap[color],
        className
      )}
    >
      {children}
    </span>
  );
}
