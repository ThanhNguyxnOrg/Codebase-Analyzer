import { C, mono } from "./tokens";
import { FileJson, FileSpreadsheet, FileText, FileCode } from "lucide-react";

const FORMATS = [
  { id: "JSON", icon: FileJson, size: "1.2 MB", desc: "machine-readable, full data" },
  { id: "CSV", icon: FileSpreadsheet, size: "340 KB", desc: "per-file metrics rows" },
  { id: "MARKDOWN", icon: FileText, size: "82 KB", desc: "readme-friendly summary" },
  { id: "HTML", icon: FileCode, size: "1.8 MB", desc: "interactive standalone report" },
];

const HISTORY = [
  { fmt: "JSON", path: "~/Downloads/codebase-analyzer-2026-06-08.json", at: "09:14" },
  { fmt: "HTML", path: "~/Downloads/report-2026-06-07.html", at: "Jun 07 · 18:32" },
  { fmt: "MARKDOWN", path: "~/Downloads/summary-2026-06-05.md", at: "Jun 05 · 14:08" },
];

export function Export() {
  return (
    <div className="px-10 py-8">
      <div
        style={{
          ...mono,
          fontSize: 11,
          color: C.muted,
          letterSpacing: "0.08em",
          marginBottom: 6,
        }}
      >
        EXPORT REPORT
      </div>
      <div style={{ fontSize: 14, color: C.muted, marginBottom: 32 }}>
        Choose a format. Files are written to your Downloads folder.
      </div>

      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
        {FORMATS.map((f) => {
          const Icon = f.icon;
          return (
            <div
              key={f.id}
              style={{
                background: C.surface,
                border: `1px solid ${C.border}`,
                borderRadius: 4,
                padding: 20,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Icon size={24} color={C.accent} strokeWidth={1.5} />
              <div style={{ ...mono, fontSize: 14, marginTop: 18, letterSpacing: "0.04em" }}>
                {f.id}
              </div>
              <div style={{ fontSize: 12, color: C.muted, marginTop: 6, minHeight: 32 }}>
                {f.desc}
              </div>
              <div
                style={{
                  ...mono,
                  fontSize: 11,
                  color: C.muted,
                  marginTop: 14,
                  marginBottom: 14,
                }}
              >
                ~{f.size}
              </div>
              <button
                style={{
                  ...mono,
                  fontSize: 11,
                  padding: "8px 0",
                  background: "transparent",
                  border: `1px solid ${C.accent}`,
                  color: C.accent,
                  borderRadius: 3,
                  cursor: "pointer",
                  letterSpacing: "0.06em",
                }}
              >
                EXPORT →
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 48 }}>
        <div
          style={{
            ...mono,
            fontSize: 11,
            color: C.muted,
            letterSpacing: "0.08em",
            marginBottom: 12,
          }}
        >
          EXPORT HISTORY
        </div>
        <div style={{ borderTop: `1px solid ${C.border}` }}>
          {HISTORY.map((h) => (
            <div
              key={h.path}
              className="flex items-center"
              style={{
                padding: "12px 4px",
                borderBottom: `1px solid ${C.border}`,
                ...mono,
                fontSize: 12,
              }}
            >
              <span
                style={{
                  color: C.accent,
                  fontSize: 10,
                  width: 70,
                  letterSpacing: "0.06em",
                }}
              >
                {h.fmt}
              </span>
              <span style={{ flex: 1, color: C.text }}>{h.path}</span>
              <span style={{ color: C.muted }}>{h.at}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
