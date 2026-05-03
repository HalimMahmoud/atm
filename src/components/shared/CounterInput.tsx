import { useState, useRef } from "react";

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
    
    // 1. Check for valid number
    if (isNaN(val)) {
      setRaw("");
      setError("Invalid number format");
      committed.current = 0;
      onChange(0);
      return;
    }

    // 2. Check for negative
    if (val < 0) {
      setRaw("");
      setError("Negative values not allowed");
      committed.current = 0;
      onChange(0);
      return;
    }

    // 3. Check for Global Max (99,900)
    if (val > 99900) {
      setRaw("");
      setError("Maximum limit is 99,900");
      committed.current = 0;
      onChange(0);
      return;
    }

    // 4. Check for Multiples of 100
    if (val % 100 !== 0) {
      setRaw("");
      setError("Must be a multiple of 100");
      committed.current = 0;
      onChange(0);
      return;
    }

    // 5. Check for Max limit (Custody availability)
    if (max !== undefined && val > max) {
      setRaw("");
      setError(`Exceeds remaining custody (Max: ${max})`);
      committed.current = 0;
      onChange(0);
      return;
    }

    // Success
    setError(null);
    committed.current = val;
    onChange(val);
    setRaw(String(val));
  };

  return (
    <div style={{ position: "relative", display: isCell ? "block" : "inline-block", width: isCell ? "100%" : "auto", height: isCell ? "100%" : "auto" }}>
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
        placeholder={isCell ? "" : "Enter amount"}
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
        style={{
          width: isCell ? "100%" : 90,
          height: isCell ? "100%" : "auto",
          textAlign: isCell ? "center" : "right",
          fontFamily: "var(--font-mono)",
          fontSize: isCell ? 13 : 13,
          padding: isCell ? "0" : "5px 8px",
          border: isCell ? "none" : `0.5px solid ${error ? "#A32D2D" : "var(--color-border-secondary)"}`,
          borderRadius: isCell ? 0 : 6,
          background: error ? "#FCEBEB" : "transparent",
          color: error ? "#A32D2D" : "var(--color-text-primary)",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      {error && (
        <div
          style={{
            position: "absolute",
            top: isCell ? "100%" : "calc(100% + 3px)",
            left: isCell ? 0 : "auto",
            right: 0,
            background: "#FCEBEB",
            color: "#A32D2D",
            fontSize: 10,
            padding: "3px 7px",
            borderRadius: 5,
            whiteSpace: "nowrap",
            border: "0.5px solid #F7C1C1",
            zIndex: 100,
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
