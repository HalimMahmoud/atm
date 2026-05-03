import { useReducer, useEffect } from "react";
import { initState, saveState } from "./utils";
import { reducer } from "./reducer";
import { BaseView } from "./components/BaseView";
import { IncreasesView } from "./components/IncreasesView";
import { HolidayView } from "./components/HolidayView";
import { SettingsView } from "./components/SettingsView";
import { MasterStatusView } from "./components/MasterStatusView";

export default function App() {
  const [state, dispatch] = useReducer(reducer, null, initState);
  const { activeTab } = state;

  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--color-background-secondary)",
        color: "var(--color-text-primary)",
        paddingBottom: "4rem",
      }}
    >
      {/* Header */}
      <header
        style={{
          background: "var(--color-background-primary)",
          borderBottom: "0.5px solid var(--color-border-tertiary)",
          padding: "1.25rem 1.5rem",
          position: "sticky",
          top: 0,
          zIndex: 100,
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="stack-mobile" style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 18, fontWeight: 600, letterSpacing: "-0.01em" }}>ATM</h1>
            <div style={{ fontSize: 12, color: "var(--color-text-secondary)", marginTop: 2 }}>Operation Dashboard v3.0</div>
          </div>
          <nav className="nav-mobile" style={{ display: "flex", gap: 6, background: "#F1EFE8", padding: 4, borderRadius: 10 }}>
            {(
              [
                ["base", "Base Custody"],
                ["increases", "Daily Increases"],
                ["holiday", "Holiday Schedules"],
                ["status", "Master Status"],
                ["settings", "Settings"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                onClick={() => dispatch({ type: "SET_TAB", tab: id })}
                style={{
                  padding: "6px 14px",
                  borderRadius: 7,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  border: "none",
                  whiteSpace: "nowrap",
                  background: activeTab === id ? "var(--color-background-primary)" : "transparent",
                  color: activeTab === id ? "var(--color-text-primary)" : "var(--color-text-secondary)",
                  boxShadow: activeTab === id ? "0 2px 8px rgba(0,0,0,0.04)" : "none",
                  transition: "all 0.15s ease",
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-container" style={{ maxWidth: 1200, margin: "1.5rem auto", padding: "0 1.5rem" }}>
        {activeTab === "base" && <BaseView state={state} />}
        {activeTab === "increases" && <IncreasesView state={state} dispatch={dispatch} />}
        {activeTab === "holiday" && <HolidayView state={state} dispatch={dispatch} />}
        {activeTab === "status" && <MasterStatusView state={state} />}
        {activeTab === "settings" && <SettingsView state={state} dispatch={dispatch} />}
      </main>

      {/* Footer */}
      <footer style={{ marginTop: "2rem", textAlign: "center", fontSize: 11, color: "var(--color-text-tertiary)" }}>
        &copy; {new Date().getFullYear()} Banking Ops Systems. Secure Terminal Management.
      </footer>
    </div>
  );
}
