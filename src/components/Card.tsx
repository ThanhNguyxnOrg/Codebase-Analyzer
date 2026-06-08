import { C, mono } from "./tokens";

export function Card({
  label,
  children,
  action,
  pad = 16,
}: {
  label?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  pad?: number;
}) {
  return (
    <div
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        borderRadius: 4,
        padding: pad,
      }}
    >
      {label && (
        <div className="flex items-center justify-between" style={{ marginBottom: 12 }}>
          <div
            style={{
              ...mono,
              fontSize: 11,
              color: C.muted,
              letterSpacing: "0.08em",
            }}
          >
            {label}
          </div>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}
