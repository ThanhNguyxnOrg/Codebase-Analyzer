import { useState } from "react";
import { C, mono, LANG_COLORS } from "./tokens";
import { LANG_DATA, TOTAL_LOC, TOTAL_FILES, TOTAL_LANGS, COMPLEXITY_DIST } from "./data";
import { Card } from "./Card";

function fmt(n: number) {
  return n.toLocaleString("en-US");
}

export function Dashboard() {
  const [rate, setRate] = useState(2400);
  const [hover, setHover] = useState<string | null>(null);

  const effort = 142;
  const months = 18;
  const cost = effort * rate * 1000;

  return (
    <div className="px-10 py-8">
      {/* breadcrumb */}
      <div style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 32 }}>
        ~ / projects /{" "}
        <span style={{ color: C.text }}>codebase-analyzer</span>
      </div>

      <div className="grid gap-8" style={{ gridTemplateColumns: "2fr 1fr" }}>
        {/* Left column */}
        <div>
          <div
            style={{
              ...mono,
              fontSize: 11,
              color: C.muted,
              letterSpacing: "0.08em",
              marginBottom: 8,
            }}
          >
            LINES OF CODE
          </div>
          <div
            style={{
              ...mono,
              fontSize: 56,
              lineHeight: 1,
              letterSpacing: "-0.02em",
              fontVariantNumeric: "tabular-nums",
              color: C.text,
              fontWeight: 500,
            }}
          >
            {fmt(TOTAL_LOC)}
          </div>

          <div className="flex gap-8" style={{ marginTop: 24 }}>
            {[
              { v: fmt(TOTAL_FILES), l: "FILES" },
              { v: TOTAL_LANGS, l: "LANGUAGES" },
              { v: "~$340K", l: "EST. COST" },
            ].map((it) => (
              <div key={it.l}>
                <div
                  style={{
                    ...mono,
                    fontSize: 20,
                    fontVariantNumeric: "tabular-nums",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {it.v}
                </div>
                <div
                  style={{
                    ...mono,
                    fontSize: 10,
                    color: C.muted,
                    letterSpacing: "0.08em",
                    marginTop: 4,
                  }}
                >
                  {it.l}
                </div>
              </div>
            ))}
          </div>

          {/* Stacked bar */}
          <div style={{ marginTop: 40 }}>
            <div
              style={{
                ...mono,
                fontSize: 11,
                color: C.muted,
                letterSpacing: "0.08em",
                marginBottom: 10,
              }}
            >
              LANGUAGE DISTRIBUTION
            </div>
            <div
              style={{
                display: "flex",
                width: "100%",
                height: 24,
                borderRadius: 2,
                overflow: "hidden",
                border: `1px solid ${C.border}`,
              }}
            >
              {LANG_DATA.map((l) => (
                <div
                  key={l.name}
                  onMouseEnter={() => setHover(l.name)}
                  onMouseLeave={() => setHover(null)}
                  style={{
                    width: `${l.pct}%`,
                    background: LANG_COLORS[l.name] || C.muted,
                    opacity: hover && hover !== l.name ? 0.35 : 1,
                    transition: "opacity 150ms",
                  }}
                  title={`${l.name} · ${l.pct}%`}
                />
              ))}
            </div>
            <div
              style={{
                ...mono,
                fontSize: 11,
                color: C.muted,
                marginTop: 8,
                minHeight: 14,
              }}
            >
              {hover
                ? `${hover} — ${LANG_DATA.find((l) => l.name === hover)?.pct}% · ${fmt(
                    LANG_DATA.find((l) => l.name === hover)?.code || 0,
                  )} loc`
                : "hover a segment for details"}
            </div>
          </div>

          {/* Table */}
          <div style={{ marginTop: 32 }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                ...mono,
                fontSize: 12,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              <thead>
                <tr style={{ color: C.muted, fontSize: 10, letterSpacing: "0.08em" }}>
                  <th style={th}>LANGUAGE</th>
                  <th style={thRight}>FILES</th>
                  <th style={thRight}>CODE</th>
                  <th style={thRight}>COMMENTS</th>
                  <th style={thRight}>BLANKS</th>
                  <th style={thRight}>%</th>
                </tr>
              </thead>
              <tbody>
                {LANG_DATA.map((l, i) => (
                  <tr
                    key={l.name}
                    style={{
                      background: i % 2 ? "#ffffff04" : "transparent",
                      borderTop: `1px solid ${C.border}`,
                    }}
                  >
                    <td style={td}>
                      <span
                        style={{
                          display: "inline-block",
                          width: 8,
                          height: 8,
                          borderRadius: 4,
                          background: LANG_COLORS[l.name] || C.muted,
                          marginRight: 10,
                          verticalAlign: "middle",
                        }}
                      />
                      {l.name}
                    </td>
                    <td style={tdRight}>{fmt(l.files)}</td>
                    <td style={tdRight}>{fmt(l.code)}</td>
                    <td style={tdRight}>{fmt(l.comments)}</td>
                    <td style={tdRight}>{fmt(l.blanks)}</td>
                    <td style={{ ...tdRight, color: C.muted }}>{l.pct.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <Card label="COMPLEXITY">
            <div
              style={{
                ...mono,
                fontSize: 36,
                letterSpacing: "-0.02em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              4.7
            </div>
            <div style={{ ...mono, fontSize: 10, color: C.muted, marginTop: 4 }}>
              average · cyclomatic
            </div>
            <div className="flex items-end gap-1" style={{ marginTop: 18, height: 36 }}>
              {COMPLEXITY_DIST.map((v, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: `${(v / Math.max(...COMPLEXITY_DIST)) * 100}%`,
                    background: i === 4 ? C.accent : C.border,
                  }}
                />
              ))}
            </div>
            <div
              className="flex justify-between"
              style={{ ...mono, fontSize: 10, color: C.muted, marginTop: 6 }}
            >
              <span>1</span>
              <span>20+</span>
            </div>
          </Card>

          <Card label="COCOMO ESTIMATE">
            <div className="flex justify-between" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: C.muted }}>Effort</span>
              <span style={{ ...mono, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                {effort} person-months
              </span>
            </div>
            <div className="flex justify-between" style={{ marginBottom: 10 }}>
              <span style={{ fontSize: 12, color: C.muted }}>Time</span>
              <span style={{ ...mono, fontSize: 13, fontVariantNumeric: "tabular-nums" }}>
                {months} months
              </span>
            </div>
            <div className="flex justify-between" style={{ marginBottom: 14 }}>
              <span style={{ fontSize: 12, color: C.muted }}>Cost</span>
              <span
                style={{
                  ...mono,
                  fontSize: 16,
                  color: C.accent,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.02em",
                }}
              >
                ${fmt(cost)}
              </span>
            </div>
            <div
              className="flex items-center gap-2"
              style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12 }}
            >
              <label style={{ fontSize: 11, color: C.muted }}>$/month</label>
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(Number(e.target.value) || 0)}
                style={{
                  ...mono,
                  fontSize: 12,
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 3,
                  padding: "4px 8px",
                  color: C.text,
                  width: 90,
                  outline: "none",
                }}
              />
              <span style={{ ...mono, fontSize: 11, color: C.muted }}>× 1000</span>
            </div>
          </Card>

          <Card label="DUPLICATES">
            <div className="flex items-baseline justify-between">
              <div>
                <span
                  style={{
                    ...mono,
                    fontSize: 28,
                    letterSpacing: "-0.02em",
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  23
                </span>
                <span style={{ fontSize: 12, color: C.muted, marginLeft: 8 }}>
                  duplicate files
                </span>
              </div>
              <button
                style={{
                  ...mono,
                  fontSize: 11,
                  background: "transparent",
                  border: `1px solid ${C.border}`,
                  borderRadius: 3,
                  padding: "4px 10px",
                  color: C.accent,
                  cursor: "pointer",
                }}
              >
                VIEW →
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 6px",
  fontWeight: 500,
};
const thRight: React.CSSProperties = { ...th, textAlign: "right" };
const td: React.CSSProperties = { padding: "10px 6px" };
const tdRight: React.CSSProperties = { ...td, textAlign: "right" };
