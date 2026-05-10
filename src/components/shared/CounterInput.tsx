import { useState, useRef } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { AlertCircle } from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CounterInputProps {
  value: number;
  max?: number;
  onChange: (val: number) => void;
  variant?: "default" | "cell";
}

export function CounterInput({ value, max, onChange, variant = "default" }: CounterInputProps) {
  const [prevValue, setPrevValue] = useState(value);
  const [raw, setRaw] = useState(value === 0 ? "" : String(value));
  const [error, setError] = useState<string | null>(null);
  const committed = useRef(value);

  const isCell = variant === "cell";

  if (value !== prevValue) {
    setPrevValue(value);
    setRaw(value === 0 ? "" : String(value));
    setError(null);
  }

  const commit = () => {
    if (raw === "") {
      setError(null);
      committed.current = 0;
      onChange(0);
      return;
    }

    const val = Number(raw);
    
    if (isNaN(val)) {
      setRaw("");
      setError("Invalid number format");
      committed.current = 0;
      onChange(0);
      return;
    }

    if (val < 0) {
      setRaw("");
      setError("Negative values not allowed");
      committed.current = 0;
      onChange(0);
      return;
    }

    if (val > 99900) {
      setRaw("");
      setError("Maximum limit is 99,900");
      committed.current = 0;
      onChange(0);
      return;
    }

    if (val % 100 !== 0) {
      setRaw("");
      setError("Must be a multiple of 100");
      committed.current = 0;
      onChange(0);
      return;
    }

    if (max !== undefined && val > max) {
      setRaw("");
      setError(`Exceeds remaining custody (Max: ${max})`);
      committed.current = 0;
      onChange(0);
      return;
    }

    setError(null);
    committed.current = val;
    onChange(val);
    setRaw(String(val));
  };

  return (
    <div className={cn("relative", isCell ? "w-full h-full" : "inline-block")}>
      <style>{`
        input::-webkit-outer-spin-button,
        input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>
      <input
        type="number"
        value={raw}
        placeholder={isCell ? "" : "0"}
        onChange={(e) => {
          setRaw(e.target.value);
          setError(null);
        }}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            (e.target as HTMLInputElement).blur();
          }
        }}
        className={cn(
          "font-mono text-sm transition-all duration-200 outline-none",
          isCell 
            ? "w-full h-full bg-transparent text-center border-none focus:ring-0" 
            : "w-24 px-3 py-1.5 rounded-lg border text-right",
          error 
            ? "bg-red-50 text-red-600 border-red-200 focus:ring-red-500/20" 
            : "bg-white text-slate-900 border-slate-200 focus:border-slate-400 focus:ring-2 focus:ring-slate-400/10"
        )}
      />
      {error && (
        <div className={cn(
          "absolute z-[100] flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-red-100 text-red-600 text-[10px] font-semibold shadow-lg whitespace-nowrap animate-in fade-in zoom-in duration-200",
          isCell ? "top-full mt-1 left-1/2 -translate-x-1/2" : "top-full mt-1 right-0"
        )}>
          <AlertCircle className="w-3 h-3" />
          {error}
        </div>
      )}
    </div>
  );
}
