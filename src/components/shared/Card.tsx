import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export function Card({ children, className, onClick, style }: CardProps) {
  return (
    <div
      onClick={onClick}
      style={style}
      className={cn(
        "bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-soft transition-all duration-200",
        onClick && "cursor-pointer hover:border-slate-300 hover:shadow-md active:scale-[0.99]",
        className
      )}
    >
      {children}
    </div>
  );
}
