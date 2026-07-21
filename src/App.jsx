import React, { useState, useEffect, useCallback } from "react";
import { Check, Plus, X, Flame, CalendarDays, BarChart3 } from "lucide-react";

const STORAGE_KEY = "trackyourday-habits";

const COLORS = {
  ink: "#1B2A4A",
  inkSoft: "#2E4066",
  paper: "#F6F1E7",
  paperLine: "#D9D0BC",
  rule: "#B8C4D9",
  ember: "#C1443C",
  graphite: "#3D3D3D",
  sage: "#5C8567",
  sageSoft: "#E4ECE3",
  muted: "#8A8272",
};

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

function dateLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function lastNDays(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().split("T")[0]);
  }
  return out;
}

function calcStreak(completedDates) {
  const set = new Set(completedDates);
  let streak = 0;
  let cursor = new Date();
  if (!set.has(todayStr())) {
    cursor.setDate(cursor.getDate() - 1);
  }
  while (true) {
    const key = cursor.toISOString().split("T")[0];
    if (set.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

const SEED_HABITS = [
  { id: "seed-1", name: "Read for 20 minutes", completedDates: [] },
  { id: "seed-2", name: "Review lecture notes", completedDates: [] },
  { id: "seed-3", name: "No phone before bed", completedDates: [] },
];

function loadHabits() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : SEED_HABITS;
  } catch (e) {
    return SEED_HABITS;
  }
}

export default function App() {
  const [habits, setHabits] = useState(loadHabits);
  const [view, setView] = useState("today");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  const persist = useCallback((next) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setError("");
    } catch (e) {
      setError("Couldn't save — your device storage may be full or blocked.");
    }
  }, []);

  const updateHabits = (updater) => {
    setHabits((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      persist(next);
      return next;
    });
  };

  const addHabit = () => {
    const name = draft.trim();
    if (!name) return;
    updateHabits((prev) => [
      ...prev,
      { id: `h-${Date.now()}`, name, completedDates: [] },
    ]);
    setDraft("");
  };

  const toggleToday = (id) => {
    const t = todayStr();
    updateHabits((prev) =>
      prev.map((h) => {
        if (h.id !== id) return h;
        const has = h.completedDates.includes(t);
        return {
          ...h,
          completedDates: has
            ? h.completedDates.filter((d) => d !== t)
            : [...h.completedDates, t],
        };
      })
    );
  };

  const removeHabit = (id) => {
    updateHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const t = todayStr();
  const doneToday = habits.filter((h) => h.completedDates.includes(t)).length;
  const totalHabits = habits.length;
  const completionPct = totalHabits ? Math.round((doneToday / totalHabits) * 100) : 0;
  const longestStreak = habits.reduce(
    (max, h) => Math.max(max, calcStreak(h.completedDates)),
    0
  );
  const week = lastNDays(7);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center py-8 px-4"
      style={{ background: COLORS.ink }}
    >
      <div
        className="w-full max-w-sm rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
        style={{ background: COLORS.paper, minHeight: "700px", border: `1px solid ${COLORS.inkSoft}` }}
      >
        <div className="px-6 pt-7 pb-5 flex flex-col gap-1" style={{ background: COLORS.ink }}>
          <div className="flex items-baseline justify-between">
            <h1
              style={{ fontFamily: "'Fraunces', serif", color: COLORS.paper, fontWeight: 700 }}
              className="text-2xl"
            >
              Trackyourday
            </h1>
            <div
              className="flex items-center gap-1 px-2 py-1 rounded-full"
              style={{ background: "rgba(246,241,231,0.12)" }}
            >
              <Flame size={14} color="#E8A33D" />
              <span
                style={{ fontFamily: "'JetBrains Mono', monospace", color: "#E8A33D" }}
                className="text-xs font-bold"
              >
                {longestStreak}
              </span>
            </div>
          </div>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.rule }} className="text-xs">
            {dateLabel()}
          </p>
        </div>

        <div className="flex" style={{ borderBottom: `1px solid ${COLORS.paperLine}` }}>
          {[
            { key: "today", label: "Today", icon: CalendarDays },
            { key: "stats", label: "Stats", icon: BarChart3 },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className="flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-medium transition-colors"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: view === key ? COLORS.ink : COLORS.muted,
                borderBottom: view === key ? `2px solid ${COLORS.ember}` : "2px solid transparent",
              }}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        <div
          className="flex-1 relative overflow-y-auto"
          style={{
            backgroundImage: `repeating-linear-gradient(${COLORS.paper}, ${COLORS.paper} 34px, ${COLORS.paperLine} 35px)`,
          }}
        >
          <div className="absolute top-0 bottom-0 w-px" style={{ left: "28px", background: COLORS.ember, opacity: 0.35 }} />

          {view === "today" ? (
            <div className="pl-10 pr-5 py-4 flex flex-col gap-1">
              {totalHabits > 0 && (
                <div className="mb-2 text-xs" style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.muted }}>
                  {doneToday}/{totalHabits} done · {completionPct}%
                </div>
              )}

              {habits.length === 0 && (
                <p className="text-sm py-6" style={{ fontFamily: "'Inter', sans-serif", color: COLORS.muted }}>
                  No habits yet. Add your first line below.
                </p>
              )}

              {habits.map((h) => {
                const done = h.completedDates.includes(t);
                const streak = calcStreak(h.completedDates);
                return (
                  <div key={h.id} className="group flex items-center gap-3 py-1.5" style={{ minHeight: "35px" }}>
                    <button
                      onClick={() => toggleToday(h.id)}
                      className="flex items-center justify-center shrink-0 transition-all"
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: 6,
                        border: `2px solid ${done ? COLORS.sage : COLORS.rule}`,
                        background: done ? COLORS.sage : "transparent",
                      }}
                      aria-label={done ? `Mark ${h.name} not done` : `Mark ${h.name} done`}
                    >
                      {done && <Check size={14} color={COLORS.paper} strokeWidth={3} />}
                    </button>
                    <span
                      className="flex-1 text-sm"
                      style={{
                        fontFamily: "'Inter', sans-serif",
                        color: done ? COLORS.muted : COLORS.graphite,
                        textDecoration: done ? "line-through" : "none",
                        fontWeight: 500,
                      }}
                    >
                      {h.name}
                    </span>
                    {streak > 0 && (
                      <span className="text-xs shrink-0" style={{ fontFamily: "'JetBrains Mono', monospace", color: "#B8792E" }}>
                        {streak}d
                      </span>
                    )}
                    <button
                      onClick={() => removeHabit(h.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label={`Delete ${h.name}`}
                    >
                      <X size={14} color={COLORS.ember} />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="pl-10 pr-5 py-4 flex flex-col gap-5">
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Habits", value: totalHabits },
                  { label: "Today", value: `${completionPct}%` },
                  { label: "Best streak", value: `${longestStreak}d` },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg p-3 flex flex-col items-center gap-1" style={{ background: COLORS.sageSoft }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", color: COLORS.ink }} className="text-lg font-bold">
                      {s.value}
                    </span>
                    <span style={{ fontFamily: "'Inter', sans-serif", color: COLORS.muted }} className="text-[10px] uppercase tracking-wide">
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>

              <div>
                <h3 style={{ fontFamily: "'Fraunces', serif", color: COLORS.ink }} className="text-sm font-semibold mb-2">
                  Last 7 days
                </h3>
                {habits.length === 0 && (
                  <p style={{ fontFamily: "'Inter', sans-serif", color: COLORS.muted }} className="text-sm">
                    Add habits to see your week.
                  </p>
                )}
                <div className="flex flex-col gap-2">
                  {habits.map((h) => (
                    <div key={h.id} className="flex items-center gap-2">
                      <span
                        className="text-xs w-24 truncate"
                        style={{ fontFamily: "'Inter', sans-serif", color: COLORS.graphite }}
                        title={h.name}
                      >
                        {h.name}
                      </span>
                      <div className="flex gap-1">
                        {week.map((d) => {
                          const done = h.completedDates.includes(d);
                          return (
                            <div
                              key={d}
                              style={{ width: 16, height: 16, borderRadius: 4, background: done ? COLORS.sage : COLORS.paperLine }}
                              title={d}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-3 flex items-center gap-2" style={{ background: COLORS.paper, borderTop: `1px solid ${COLORS.paperLine}` }}>
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addHabit()}
            placeholder="Add a habit or task…"
            className="flex-1 px-3 py-2 rounded-lg text-sm outline-none"
            style={{ fontFamily: "'Inter', sans-serif", background: "#fff", border: `1px solid ${COLORS.paperLine}`, color: COLORS.graphite }}
          />
          <button
            onClick={addHabit}
            className="shrink-0 flex items-center justify-center rounded-lg"
            style={{ width: 38, height: 38, background: COLORS.ink }}
            aria-label="Add habit"
          >
            <Plus size={18} color={COLORS.paper} />
          </button>
        </div>
        {error && (
          <p className="px-4 pb-3 text-xs" style={{ color: COLORS.ember, fontFamily: "'Inter', sans-serif" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}