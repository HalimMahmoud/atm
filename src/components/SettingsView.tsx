import React, { useState } from "react";
import type { AppState, Action, BaseData } from "../types";
import { ATM_COLORS, DENOMINATIONS } from "../types";
import { calcTotal, fmt } from "../utils";
import { Card } from "./shared/Card";
import { Btn } from "./shared/Btn";
import { CounterInput } from "./shared/CounterInput";

export function SettingsView({ state, dispatch }: { state: AppState; dispatch: React.Dispatch<Action> }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [tempBase, setTempBase] = useState<BaseData>(state.base);
  const [tempCount, setTempCount] = useState(state.atmCount);

  const ATM_IDS = Array.from({ length: tempCount }, (_, i) => `ATM ${i + 1}`);

  const login = () => {
    if (pin === "1234") {
      setIsAdmin(true);
      setError("");
    } else {
      setError("Invalid PIN");
    }
  };

  const saveBase = () => {
    dispatch({ type: "SET_BASE", base: tempBase });
    dispatch({ type: "UPDATE_ATM_COUNT", count: tempCount });
    setIsAdmin(false);
    setPin("");
  };

  const reset = () => {
    if (confirm("Are you sure? This will delete all increases and holiday schedules!")) {
      dispatch({ type: "RESET_ALL" });
    }
  };

  if (!isAdmin)
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
        <Card style={{ width: "100%", maxWidth: 360, textAlign: "center" }}>
          <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 8, color: "var(--color-text-primary)" }}>Admin Access</div>
          <p style={{ fontSize: 13, color: "var(--color-text-secondary)", marginBottom: 16 }}>Enter Super Admin PIN to edit fleet settings.</p>
          <input
            type="password"
            placeholder="PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            style={{
              width: "100%",
              padding: "10px",
              marginBottom: 10,
              textAlign: "center",
              fontSize: 16,
              borderRadius: 8,
              border: "0.5px solid var(--color-border-secondary)",
              background: "var(--color-background-secondary)",
              color: "var(--color-text-primary)",
              boxSizing: "border-box",
            }}
          />
          {error && <div style={{ color: "#A32D2D", fontSize: 12, marginBottom: 10 }}>{error}</div>}
          <Btn variant="primary" style={{ width: "100%" }} onClick={login}>
            Authorize
          </Btn>
          <div style={{ marginTop: "2rem", borderTop: "0.5px solid var(--color-border-tertiary)", paddingTop: "1rem" }}>
            <Btn variant="danger" style={{ width: "100%" }} onClick={reset}>
              Factory Reset App
            </Btn>
          </div>
        </Card>
      </div>
    );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 500, color: "var(--color-text-primary)" }}>Fleet Configuration</h2>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Manage ATMs and base custody levels</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="primary" onClick={saveBase}>
            Save All Changes
          </Btn>
          <Btn onClick={() => setIsAdmin(false)}>Cancel</Btn>
        </div>
      </div>

      <Card style={{ marginBottom: 20, background: "rgba(24, 95, 165, 0.05)", border: "1px solid #185FA5" }}>
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>Active Fleet Size</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={tempCount} 
            onChange={(e) => {
              const newCount = parseInt(e.target.value);
              setTempCount(newCount);
              // Ensure tempBase has keys for new ATMs
              const newBase = { ...tempBase };
              for(let i=1; i<=newCount; i++) {
                const id = `ATM ${i}`;
                if(!newBase[id]) {
                  newBase[id] = { 200: 0, 100: 0, 50: 0, 10: 0 };
                }
              }
              setTempBase(newBase);
            }} 
            style={{ flex: 1 }}
          />
          <div style={{ fontSize: 20, fontWeight: 800, color: "#185FA5", minWidth: 40 }}>{tempCount}</div>
          <div style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>ATMs</div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {ATM_IDS.map((id) => (
          <Card key={id} style={{ borderTop: `4px solid ${ATM_COLORS[id] || "#185FA5"}` }}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 12, color: ATM_COLORS[id] || "#185FA5" }}>{id}</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 15px" }}>
              {DENOMINATIONS.map((d) => (
                <div key={d}>
                  <label style={{ display: "block", fontSize: 11, color: "var(--color-text-secondary)", marginBottom: 4 }}>EGP {d} Count</label>
                  <CounterInput
                    value={tempBase[id]?.[d] || 0}
                    onChange={(v) => setTempBase({ ...tempBase, [id]: { ...(tempBase[id] || { 200: 0, 100: 0, 50: 0, 10: 0 }), [d]: v } })}
                  />
                  <div style={{ fontSize: 10, color: "var(--color-text-secondary)", marginTop: 2, textAlign: "right", fontFamily: "var(--font-mono)" }}>
                    EGP {fmt((tempBase[id]?.[d] || 0) * d)}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 14, paddingTop: 8, borderTop: "1px solid var(--color-border-tertiary)", display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 500 }}>
              <span>ATM Total</span>
              <span style={{ color: ATM_COLORS[id] || "#185FA5", fontFamily: "var(--font-mono)", fontWeight: 700 }}>EGP {fmt(calcTotal(tempBase[id] || { 200: 0, 100: 0, 50: 0, 10: 0 }))}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
