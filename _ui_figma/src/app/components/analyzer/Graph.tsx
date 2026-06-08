import { useState } from "react";
import { C, mono, LANG_COLORS } from "./tokens";
import { GRAPH_NODES, GRAPH_EDGES } from "./data";
import { ZoomIn, ZoomOut, Search } from "lucide-react";

export function Graph() {
  const [sel, setSel] = useState<string | null>("scanner/parser");
  const selNode = GRAPH_NODES.find((n) => n.id === sel);
  const imports = GRAPH_EDGES.filter((e) => e[0] === sel).length;
  const importedBy = GRAPH_EDGES.filter((e) => e[1] === sel).length;

  return (
    <div style={{ height: "100%", position: "relative", background: C.bg }}>
      <svg width="100%" height="100%" viewBox="0 0 900 560">
        {/* clusters */}
        <rect x="430" y="60" width="320" height="240" fill="#ffffff04" rx="4" />
        <rect x="120" y="340" width="660" height="140" fill="#ffffff04" rx="4" />

        {/* edges */}
        {GRAPH_EDGES.map(([a, b], i) => {
          const A = GRAPH_NODES.find((n) => n.id === a)!;
          const B = GRAPH_NODES.find((n) => n.id === b)!;
          const mx = (A.x + B.x) / 2;
          const my = (A.y + B.y) / 2 - 20;
          const active = sel && (a === sel || b === sel);
          return (
            <g key={i}>
              <path
                d={`M ${A.x} ${A.y} Q ${mx} ${my} ${B.x} ${B.y}`}
                stroke={active ? C.accent : C.border}
                strokeWidth={active ? 1.2 : 0.8}
                fill="none"
                opacity={active ? 1 : 0.7}
              />
            </g>
          );
        })}

        {/* nodes */}
        {GRAPH_NODES.map((n) => {
          const active = n.id === sel;
          return (
            <g
              key={n.id}
              style={{ cursor: "pointer" }}
              onClick={() => setSel(n.id)}
            >
              <circle
                cx={n.x}
                cy={n.y}
                r={active ? 9 : 6}
                fill={LANG_COLORS[n.lang]}
                stroke={active ? C.accent : "transparent"}
                strokeWidth={2}
              />
              <text
                x={n.x + 12}
                y={n.y + 4}
                fill={active ? C.text : C.muted}
                style={{ ...mono, fontSize: 10 }}
              >
                {n.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* toolbar */}
      <div
        className="flex items-center gap-2 absolute"
        style={{
          top: 20,
          right: 20,
          background: C.surface,
          border: `1px solid ${C.border}`,
          borderRadius: 4,
          padding: 6,
        }}
      >
        <button style={iconBtn}>
          <ZoomOut size={14} color={C.muted} />
        </button>
        <button style={iconBtn}>
          <ZoomIn size={14} color={C.muted} />
        </button>
        <div style={{ width: 1, height: 18, background: C.border }} />
        <select
          style={{
            ...mono,
            fontSize: 11,
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 3,
            color: C.text,
            padding: "4px 6px",
            outline: "none",
          }}
        >
          <option>All languages</option>
          <option>Rust</option>
          <option>TypeScript</option>
        </select>
        <div
          className="flex items-center gap-1"
          style={{
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 3,
            padding: "3px 8px",
          }}
        >
          <Search size={12} color={C.muted} />
          <input
            placeholder="search nodes"
            style={{
              ...mono,
              fontSize: 11,
              background: "transparent",
              border: "none",
              outline: "none",
              color: C.text,
              width: 110,
            }}
          />
        </div>
      </div>

      {/* node panel */}
      {selNode && (
        <div
          className="absolute"
          style={{
            left: selNode.x + 24,
            top: selNode.y + 16,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 4,
            padding: 14,
            minWidth: 200,
          }}
        >
          <div style={{ ...mono, fontSize: 12, marginBottom: 10 }}>{selNode.id}</div>
          <Stat label="LANGUAGE" value={selNode.lang} color={LANG_COLORS[selNode.lang]} />
          <Stat label="IMPORTS" value={String(imports)} />
          <Stat label="IMPORTED BY" value={String(importedBy)} />
          <Stat label="LOC" value="640" />
        </div>
      )}
    </div>
  );
}

const iconBtn: React.CSSProperties = {
  background: "transparent",
  border: "none",
  padding: 4,
  cursor: "pointer",
  display: "flex",
};

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between" style={{ padding: "5px 0" }}>
      <span style={{ ...mono, fontSize: 10, color: C.muted, letterSpacing: "0.08em" }}>
        {label}
      </span>
      <span style={{ ...mono, fontSize: 11, color: C.text }}>
        {color && (
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: 3,
              background: color,
              marginRight: 6,
              verticalAlign: "middle",
            }}
          />
        )}
        {value}
      </span>
    </div>
  );
}
