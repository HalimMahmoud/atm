import type { AppState } from "../types";
import { ATM_COLORS, DENOMINATIONS } from "../types";
import { calcTotal, fmt } from "../utils";
import { Card } from "./shared/Card";
import { Badge } from "./shared/Badge";

export function BaseView({ state }: { state: AppState }) {
  const { base, atmCount } = state;
  const ATM_IDS = Array.from({ length: atmCount }, (_, i) => `ATM ${i + 1}`);
  
  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "1.25rem",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Read-only view — edit via Settings (admin PIN).</span>
        <div style={{ background: "#E6F1FB", color: "#185FA5", borderRadius: 8, padding: "6px 14px", fontSize: 13, fontWeight: 500 }}>
          Grand Base Total: EGP {fmt(ATM_IDS.reduce((s, id) => s + calcTotal(base[id] || { 200: 0, 100: 0, 50: 0, 10: 0 }), 0))}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 14 }}>
        {ATM_IDS.map((id) => (
          <Card key={id} style={{ borderTop: `4px solid ${ATM_COLORS[id] || "#185FA5"}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontWeight: 700, fontSize: 14, color: ATM_COLORS[id] || "var(--color-text-primary)" }}>{id}</span>
              <Badge color="blue">EGP {fmt(calcTotal(base[id] || { 200: 0, 100: 0, 50: 0, 10: 0 }))}</Badge>
            </div>
            <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ color: "var(--color-text-secondary)" }}>
                  <th style={{ textAlign: "left", fontWeight: 400, paddingBottom: 4 }}>Denom</th>
                  <th style={{ textAlign: "right", fontWeight: 400, paddingBottom: 4 }}>Count</th>
                  <th style={{ textAlign: "right", fontWeight: 400, paddingBottom: 4 }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {DENOMINATIONS.map((d) => (
                  <tr key={d} style={{ borderTop: "0.5px solid var(--color-border-tertiary)" }}>
                    <td style={{ padding: "3px 0", color: "var(--color-text-secondary)" }}>EGP {d}</td>
                    <td
                      style={{
                        padding: "3px 0",
                        textAlign: "right",
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {fmt(base[id]?.[d] || 0)}
                    </td>
                    <td
                      style={{
                        padding: "3px 0",
                        textAlign: "right",
                        fontFamily: "var(--font-mono)",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      {fmt((base[id]?.[d] || 0) * d)}
                    </td>
                  </tr>
                ))}
                <tr style={{ borderTop: "1px solid var(--color-border-secondary)" }}>
                  <td colSpan={2} style={{ padding: "4px 0", fontWeight: 500, fontSize: 12 }}>
                    Total
                  </td>
                  <td
                    style={{
                      padding: "4px 0",
                      textAlign: "right",
                      fontWeight: 700,
                      fontFamily: "var(--font-mono)",
                      color: ATM_COLORS[id] || "#185FA5",
                    }}
                  >
                    {fmt(calcTotal(base[id] || { 200: 0, 100: 0, 50: 0, 10: 0 }))}
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        ))}
      </div>
    </div>
  );
}
