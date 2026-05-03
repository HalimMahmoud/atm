import type { AppState, Counts, IncreaseEntry, Denomination, AtmId } from "../types";
import { DENOMINATIONS, ATM_COLORS } from "../types";
import { calcTotal, fmt } from "../utils";
import { Card } from "./shared/Card";

export function MasterStatusView({ state }: { state: AppState }) {
  const { base, dailyIncreases, holidays, selectedDate, atmCount } = state;
  const ATM_IDS = Array.from({ length: atmCount }, (_, i) => `ATM ${i + 1}`);

  // Helpers
  const getDenomSum = (items: IncreaseEntry[], d: Denomination) => items.reduce((s, e) => s + (Number(e[d]) || 0), 0);
  
  const getAtmHolidayUsage = (id: AtmId) => {
    const counts = DENOMINATIONS.reduce((acc, d) => {
      acc[d] = holidays.reduce((s, h) => s + h.days.reduce((ds, dy) => ds + getDenomSum(dy.feedings[id] || [], d), 0), 0);
      return acc;
    }, { 200: 0, 100: 0, 50: 0, 10: 0 } as Counts);
    return { amount: calcTotal(counts), counts };
  };

  const pool = {
    initial: DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d]: holidays.reduce((s, h) => s + h.initialCounts[d], 0) }), {} as Counts),
    fed: DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d]: ATM_IDS.reduce((s, id) => s + getAtmHolidayUsage(id).counts[d], 0) }), {} as Counts),
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600 }}>Master Operation Status</h2>
        <div style={{ fontSize: 13, color: "var(--color-text-secondary)" }}>Consolidated overview of all custody and holiday pools</div>
      </div>

      <UndebitedBreakdown ATM_IDS={ATM_IDS} getAtmHolidayUsage={getAtmHolidayUsage} />
      <PoolManagement pool={pool} />
      <NetPosition ATM_IDS={ATM_IDS} base={base} dailyIncreases={dailyIncreases} selectedDate={selectedDate} getAtmHolidayUsage={getAtmHolidayUsage} />
    </div>
  );
}

function UndebitedBreakdown({ ATM_IDS, getAtmHolidayUsage }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase" }}>1. Total Undebited Breakdown</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
        {ATM_IDS.map((id: any) => {
          const usage = getAtmHolidayUsage(id);
          return (
            <Card key={id} style={{ padding: 12, borderLeft: `4px solid ${ATM_COLORS[id]}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: ATM_COLORS[id] }}>{id}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#A32D2D" }}>−EGP {fmt(usage.amount)}</div>
              </div>
              {DENOMINATIONS.map(d => (
                <div key={d} style={{ display: "flex", justifyContent: "space-between", background: "var(--color-background-secondary)", padding: "4px 10px", borderRadius: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 11, color: "var(--color-text-tertiary)" }}>{d}</span>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{usage.counts[d]}</span>
                </div>
              ))}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PoolManagement({ pool }: any) {
  const totalInitial = Object.keys(pool.initial).reduce((s, k) => s + pool.initial[Number(k) as Denomination] * Number(k), 0);
  const totalFed = Object.keys(pool.fed).reduce((s, k) => s + pool.fed[Number(k) as Denomination] * Number(k), 0);
  
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase" }}>2. Holiday Pool Management</div>
      <Card style={{ borderLeft: "4px solid #A32D2D", padding: "12px 0" }}>
        <div className="mobile-scroll-container">
          <div style={{ minWidth: 450, padding: "0 12px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr", gap: 10, padding: "0 10px", marginBottom: 8 }}>
              {["DENOM", "INITIAL", "DISPENSED", "REMAINING"].map(h => <div key={h} style={{ fontSize: 10, fontWeight: 700, color: "var(--color-text-tertiary)", textAlign: h === "DENOM" ? "left" : "center" }}>{h}</div>)}
            </div>
            {DENOMINATIONS.map(d => {
              const rem = pool.initial[d] - pool.fed[d];
              return (
                <div key={d} style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr", gap: 10, background: "var(--color-background-secondary)", padding: "8px 10px", borderRadius: 8, alignItems: "center", marginBottom: 4 }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{d}</div>
                  <div style={{ textAlign: "center", fontSize: 11 }}>{pool.initial[d]} <br/><small>{fmt(pool.initial[d]*d)}</small></div>
                  <div style={{ textAlign: "center", fontSize: 11, color: "#A32D2D" }}>{pool.fed[d]} <br/><small>{fmt(pool.fed[d]*d)}</small></div>
                  <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: rem < 0 ? "#A32D2D" : "#185FA5" }}>{rem} <br/><small>{fmt(rem*d)}</small></div>
                </div>
              );
            })}
            <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 1fr 1fr", gap: 10, padding: "10px", background: "#F8FAFC", borderRadius: 8, fontWeight: 800, fontSize: 12, marginTop: 4 }}>
              <div>TOTAL</div>
              <div style={{ textAlign: "center" }}>{fmt(totalInitial)}</div>
              <div style={{ textAlign: "center", color: "#A32D2D" }}>-{fmt(totalFed)}</div>
              <div style={{ textAlign: "center", color: "#185FA5" }}>{fmt(totalInitial - totalFed)}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function NetPosition({ ATM_IDS, base, dailyIncreases, selectedDate, getAtmHolidayUsage }: any) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", textTransform: "uppercase" }}>3. Final Net Custody Position</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: 10 }}>
        {ATM_IDS.map((id: any) => {
          const hol = getAtmHolidayUsage(id);
          return (
            <Card key={id} style={{ padding: 10, borderLeft: `4px solid ${ATM_COLORS[id]}` }}>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 10, color: ATM_COLORS[id], borderBottom: "1px solid var(--color-border-tertiary)" }}>{id}</div>
              <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 1fr 1fr 1fr", fontSize: 8, color: "var(--color-text-tertiary)", textAlign: "right", marginBottom: 4 }}>
                <div style={{ textAlign: "left" }}>DNM</div><div/><div>BASE</div><div>INC</div><div>HOL</div><div>TOT</div>
              </div>
              {DENOMINATIONS.map(d => {
                const b = base[id]?.[d] || 0, i = (dailyIncreases[selectedDate]?.[id] || []).reduce((s: any, e: any) => s + (Number(e[d]) || 0), 0), h = hol.counts[d];
                return (
                  <div key={d} style={{ display: "grid", gridTemplateColumns: "30px 1fr 1fr 1fr 1fr", fontSize: 10, padding: "4px 0", borderBottom: "1px solid var(--color-background-secondary)", textAlign: "right" }}>
                    <div style={{ textAlign: "left", fontWeight: 700 }}>{d}</div>
                    <div>{b}</div><div>{i}</div><div>{h}</div>
                    <div style={{ fontWeight: 800, color: ATM_COLORS[id] }}>{b + i + h}</div>
                  </div>
                );
              })}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
