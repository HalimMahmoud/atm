import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { AppState, Action, Holiday, HolidayDay, IncreaseEntry, Counts, Denomination } from "../types";
import { holidaySchema, type HolidayInput } from "../schemas";
import { ATM_COLORS, DENOMINATIONS } from "../types";
import { calcTotal, fmt, todayStr } from "../utils";
import { Card } from "./shared/Card";
import { Badge } from "./shared/Badge";
import { Btn } from "./shared/Btn";
import { CounterInput } from "./shared/CounterInput";
import { LedgerTable } from "./ledger/LedgerTable";

export function HolidayView({ state, dispatch }: { state: AppState; dispatch: React.Dispatch<Action> }) {
  const { holidays, atmCount } = state;
  const ATM_IDS = Array.from({ length: atmCount }, (_, i) => `ATM ${i + 1}`);
  const activeHol = holidays[0] || null;
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset: resetForm, setValue } = useForm<any>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      name: "110CASH12",
      startDate: todayStr(),
      endDate: todayStr(),
      initialCounts: { 200: 0, 100: 0, 50: 0, 10: 0 }
    }
  });

  const create = (data: HolidayInput) => {
    const start = new Date(data.startDate), end = new Date(data.endDate);
    const days: HolidayDay[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const date = d.toISOString().slice(0, 10);
      days.push({
        date,
        feedings: ATM_IDS.reduce((a, id) => ({ ...a, [id]: [] }), {}),
        dispensed: ATM_IDS.reduce((a, id) => ({ ...a, [id]: { 200: 0, 100: 0, 50: 0, 10: 0 } }), {}),
      });
    }
    dispatch({ type: "ADD_HOLIDAY", holiday: { id: Date.now(), ...data, days } as Holiday });
    resetForm();
  };

  if (!activeHol) return <InitializationForm register={register} handleSubmit={handleSubmit} create={create} errors={errors} setValue={setValue} />;

  // Pool Calculations
  const getPoolInfo = () => {
    const initial = calcTotal(activeHol.initialCounts);
    const fedDenom = DENOMINATIONS.reduce((acc, den) => {
      acc[den] = activeHol.days.reduce((s, d) => s + ATM_IDS.reduce((as, id) => as + (d.feedings[id] || []).reduce((fs, f) => fs + (Number(f[den]) || 0), 0), 0), 0);
      return acc;
    }, { 200: 0, 100: 0, 50: 0, 10: 0 } as Counts);
    
    const fed = Object.keys(fedDenom).reduce((s, k) => s + fedDenom[Number(k) as Denomination] * Number(k), 0);
    const remaining = initial - fed;
    const remainCounts = DENOMINATIONS.reduce((acc, d) => ({ ...acc, [d]: activeHol.initialCounts[d] - fedDenom[d] }), {} as Counts);
    
    return { initial, fed, remaining, remainCounts };
  };

  const pool = getPoolInfo();

  return (
    <div>
      <Header activeHol={activeHol} isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen} />
      {isSettingsOpen && <SettingsPanel activeHol={activeHol} dispatch={dispatch} setIsSettingsOpen={setIsSettingsOpen} />}
      
      <LedgerTable 
        columns={ATM_IDS.map(id => ({ key: id, label: id, color: ATM_COLORS[id] }))}
        rows={activeHol.days.map(d => ({ 
          id: d.date, 
          mainLabel: new Date(d.date).toLocaleDateString(undefined, { day: "2-digit", month: "short" }),
          rowSpan: DENOMINATIONS.length + 2
        }))}
        subRowItems={[...DENOMINATIONS, "Note", "Total"]}
        renderSideHeader={(item) => (
           item === "Total" ? "Day Feeding Total" : 
           item === "Note" ? "Feeding Note" : 
           typeof item === "number" ? `× ${item} EGP` : item
        )}
        renderCell={(date, item, atmId) => {
          const dy = activeHol.days.find(d => d.date === date)!;
          const f = dy.feedings[atmId]?.[0] || { id: 0, 200: 0, 100: 0, 50: 0, 10: 0, note: "" };
          
          const upd = (field: keyof IncreaseEntry, val: any) => {
            if (f.id === 0) {
              dispatch({ type: "HOLIDAY_ADD_FEEDING", holidayId: activeHol.id, date, atmId, entry: { id: Date.now(), 200: 0, 100: 0, 50: 0, 10: 0, note: "", [field]: val } });
            } else {
              dispatch({ type: "HOLIDAY_UPDATE_FEEDING", holidayId: activeHol.id, date, atmId, feedId: f.id, field, val });
            }
          };

          if (typeof item === "number") {
            const d = item as Denomination;
            const cur = Number(f[d]) || 0;
            return <td style={{ padding: 0, borderRight: "0.5px solid var(--color-border-tertiary)", height: 38 }}><CounterInput variant="cell" value={cur} max={pool.remainCounts[d] + cur} onChange={(v) => upd(d as any, v)} /></td>;
          }
          if (item === "Note") {
            return <td style={{ padding: 0, borderRight: "0.5px solid var(--color-border-tertiary)", height: 38 }}><input value={f.note || ""} onChange={e => upd("note", e.target.value)} style={{ width: "100%", height: "100%", border: "none", background: "transparent", textAlign: "center", fontSize: 12, outline: "none" }} placeholder="..." /></td>;
          }
          const total = calcTotal(f as Counts);
          return <td style={{ padding: 0, borderRight: "0.5px solid var(--color-border-tertiary)", height: 38, background: "rgba(24, 95, 165, 0.03)", fontWeight: 700, color: ATM_COLORS[atmId], fontSize: 12, textAlign: "center" }}>{total > 0 ? fmt(total) : "-"}</td>;
        }}
      />

      <Summary pool={pool} />
    </div>
  );
}

// Sub-components to keep HolidayView clean
function InitializationForm({ register, handleSubmit, create, errors, setValue }: any) {
  return (
    <div style={{ maxWidth: 600, margin: "2rem auto" }}>
      <Card style={{ padding: "2rem" }}>
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <h2 style={{ margin: "0 0 0.5rem", fontSize: 24, fontWeight: 700 }}>Initialize Holiday Schedule</h2>
          <p style={{ margin: 0, color: "var(--color-text-secondary)", fontSize: 14 }}>Set up your vault pool and holiday dates to begin fleet management.</p>
        </div>
        <form onSubmit={handleSubmit(create, (e: any) => console.log("Form Errors:", e))}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 20 }}>
            {[["Holiday Name", "name", "text"], ["Start Date", "startDate", "date"], ["End Date", "endDate", "date"]].map(([lbl, key, type]) => (
              <div key={key}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", display: "block", marginBottom: 6 }}>{lbl}</label>
                <input type={type} {...register(key)} style={{ width: "100%", padding: "10px 12px", border: `1px solid ${errors[key] ? "#DC2626" : "var(--color-border-tertiary)"}`, borderRadius: 10, fontSize: 14, background: "var(--color-background-secondary)", color: "var(--color-text-primary)", outline: "none" }} />
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, margin: "24px 0 12px", color: "var(--color-text-secondary)", textTransform: "uppercase" }}>Global Holiday Custody (Shared Pool)</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 32 }}>
            {DENOMINATIONS.map((d) => (
              <div key={d} style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--color-background-secondary)", padding: "8px 12px", borderRadius: 10, border: "0.5px solid var(--color-border-tertiary)" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--color-text-secondary)", width: 40 }}>× {d}</span>
                <CounterInput value={0} onChange={(v) => setValue(`initialCounts.${d}`, v)} />
              </div>
            ))}
          </div>
          <Btn type="submit" variant="primary" size="md" style={{ width: "100%", padding: "14px" }}>Create Holiday Schedule</Btn>
        </form>
      </Card>
    </div>
  );
}

function Header({ activeHol, isSettingsOpen, setIsSettingsOpen }: any) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "var(--color-text-primary)" }}>{activeHol.name}</h2>
        <Badge color="blue">{activeHol.startDate} to {activeHol.endDate}</Badge>
      </div>
      <Btn variant="default" size="sm" onClick={() => setIsSettingsOpen(!isSettingsOpen)}>{isSettingsOpen ? "Close Settings" : "⚙ Holiday Settings"}</Btn>
    </div>
  );
}

function SettingsPanel({ activeHol, dispatch, setIsSettingsOpen }: any) {
  return (
    <Card style={{ marginBottom: 20, background: "#F8FAFC", border: "1px solid #E2E8F0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 15 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#1E293B" }}>Adjust Holiday Configuration</div>
        <Btn variant="danger" size="sm" onClick={() => confirm("Delete?") && dispatch({ type: "REMOVE_HOLIDAY", holidayId: activeHol.id })}>Delete Holiday</Btn>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 6 }}>SCHEDULE DATES</label>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="date" defaultValue={activeHol.startDate} id="edit-start" style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, width: "100%" }} />
            <input type="date" defaultValue={activeHol.endDate} id="edit-end" style={{ padding: "6px 10px", borderRadius: 8, border: "1px solid #CBD5E1", fontSize: 13, width: "100%" }} />
          </div>
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 600, color: "#64748B", display: "block", marginBottom: 6 }}>INITIAL VAULT CUSTODY</label>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {DENOMINATIONS.map(d => (
              <div key={d} style={{ display: "flex", alignItems: "center", gap: 6, background: "white", padding: "4px 8px", borderRadius: 6, border: "0.5px solid #E2E8F0" }}>
                <span style={{ fontSize: 10, color: "#64748B", width: 25 }}>{d}</span>
                <CounterInput value={activeHol.initialCounts[d]} onChange={(v) => dispatch({ type: "HOLIDAY_UPDATE_INITIAL_COUNTS", holidayId: activeHol.id, counts: { ...activeHol.initialCounts, [d]: v } })} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 20, paddingTop: 15, borderTop: "1px solid #E2E8F0", display: "flex", justifyContent: "flex-end" }}>
        <Btn onClick={() => {
          const s = (document.getElementById("edit-start") as HTMLInputElement).value;
          const e = (document.getElementById("edit-end") as HTMLInputElement).value;
          const start = new Date(s), end = new Date(e), dates = [];
          for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) dates.push(d.toISOString().slice(0, 10));
          dispatch({ type: "HOLIDAY_SYNC_DAYS", holidayId: activeHol.id, dates });
          setIsSettingsOpen(false);
        }}>Update Range</Btn>
      </div>
    </Card>
  );
}

function Summary({ pool }: any) {
  return (
    <Card>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 15, marginBottom: 20 }}>
        <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>TOTAL POOL</div><div style={{ fontSize: 16, fontWeight: 600 }}>EGP {fmt(pool.initial)}</div></div>
        <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>UNDEBITED</div><div style={{ fontSize: 16, fontWeight: 600, color: "#A32D2D" }}>−EGP {fmt(pool.fed)}</div></div>
        <div><div style={{ fontSize: 11, color: "var(--color-text-secondary)" }}>REMAINING</div><div style={{ fontSize: 18, fontWeight: 700, color: pool.remaining < 0 ? "#A32D2D" : "#185FA5" }}>EGP {fmt(pool.remaining)}</div></div>
      </div>
      <div style={{ paddingTop: 15, borderTop: "0.5px solid var(--color-border-tertiary)" }}>
        <div style={{ display: "flex", gap: 10 }}>
          {DENOMINATIONS.map(d => (
            <div key={d} style={{ flex: 1, background: "var(--color-background-secondary)", padding: "10px", borderRadius: 8, textAlign: "center" }}>
              <div style={{ fontSize: 10, color: "var(--color-text-tertiary)" }}>×{d}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: pool.remainCounts[d] <= 0 ? "#A32D2D" : "#185FA5" }}>{pool.remainCounts[d]}</div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
