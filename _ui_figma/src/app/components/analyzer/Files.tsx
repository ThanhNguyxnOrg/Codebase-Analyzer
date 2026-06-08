import { useMemo, useState } from "react";
import { C, mono, LANG_COLORS } from "./tokens";
import { TREE, TreeNode, TREEMAP_FILES } from "./data";

function flatten(nodes: TreeNode[], depth = 0): { node: TreeNode; depth: number }[] {
  const out: { node: TreeNode; depth: number }[] = [];
  for (const n of nodes) {
    out.push({ node: n, depth });
    if (n.children) out.push(...flatten(n.children, depth + 1));
  }
  return out;
}

type Rect = { x: number; y: number; w: number; h: number; item: typeof TREEMAP_FILES[0] };

function squarify(items: typeof TREEMAP_FILES, W: number, H: number): Rect[] {
  const total = items.reduce((s, i) => s + i.loc, 0);
  const rects: Rect[] = [];
  let x = 0,
    y = 0,
    remW = W,
    remH = H;
  let i = 0;
  while (i < items.length) {
    const remaining = items.slice(i);
    const remTotal = remaining.reduce((s, it) => s + it.loc, 0);
    const horizontal = remW >= remH;
    const stripSize = horizontal ? remH : remW;
    // pick number of items for this row to keep aspect ratio reasonable
    let count = 1;
    while (count < remaining.length) {
      const sum = remaining.slice(0, count + 1).reduce((s, it) => s + it.loc, 0);
      const newRatio = compareRatio(remaining.slice(0, count + 1), stripSize, sum, remTotal, remW, remH);
      const oldSum = remaining.slice(0, count).reduce((s, it) => s + it.loc, 0);
      const oldRatio = compareRatio(remaining.slice(0, count), stripSize, oldSum, remTotal, remW, remH);
      if (newRatio > oldRatio) break;
      count++;
    }
    const row = remaining.slice(0, count);
    const rowSum = row.reduce((s, it) => s + it.loc, 0);
    const stripLen = horizontal
      ? (rowSum / remTotal) * remW
      : (rowSum / remTotal) * remH;
    let cursor = horizontal ? y : x;
    for (const it of row) {
      const share = it.loc / rowSum;
      if (horizontal) {
        const h = share * remH;
        rects.push({ x, y: cursor, w: stripLen, h, item: it });
        cursor += h;
      } else {
        const w = share * remW;
        rects.push({ x: cursor, y, w, h: stripLen, item: it });
        cursor += w;
      }
    }
    if (horizontal) {
      x += stripLen;
      remW -= stripLen;
    } else {
      y += stripLen;
      remH -= stripLen;
    }
    i += count;
  }
  return rects;
}

function compareRatio(
  row: typeof TREEMAP_FILES,
  stripSize: number,
  rowSum: number,
  total: number,
  W: number,
  H: number,
) {
  if (row.length === 0) return Infinity;
  const area = (rowSum / total) * W * H;
  const len = area / stripSize;
  let worst = 0;
  for (const it of row) {
    const a = (it.loc / total) * W * H;
    const side = a / len;
    worst = Math.max(worst, len / side, side / len);
  }
  return worst;
}

export function Files() {
  const flat = useMemo(() => flatten(TREE), []);
  const [sel, setSel] = useState<string>("parser.rs");
  const rects = useMemo(() => squarify(TREEMAP_FILES, 560, 480), []);
  const selected = TREEMAP_FILES.find((f) => f.name === sel) || TREEMAP_FILES[0];

  const code = Math.round(selected.loc * 0.78);
  const comments = Math.round(selected.loc * 0.13);
  const blanks = selected.loc - code - comments;

  return (
    <div
      className="grid h-full"
      style={{ gridTemplateColumns: "30% 1fr 25%", height: "100%" }}
    >
      {/* tree */}
      <div
        style={{
          borderRight: `1px solid ${C.border}`,
          padding: "20px 0",
          overflow: "auto",
        }}
      >
        <div
          style={{
            ...mono,
            fontSize: 11,
            color: C.muted,
            letterSpacing: "0.08em",
            padding: "0 20px 12px",
          }}
        >
          FILE TREE
        </div>
        {flat.map(({ node, depth }) => {
          const isFile = !node.children;
          const active = node.name === sel;
          return (
            <button
              key={node.name + depth}
              onClick={() => isFile && setSel(node.name)}
              className="w-full flex items-center text-left"
              style={{
                padding: `5px 20px 5px ${20 + depth * 14}px`,
                background: active ? `${C.accent}15` : "transparent",
                borderLeft: active ? `2px solid ${C.accent}` : "2px solid transparent",
                ...mono,
                fontSize: 12,
                color: isFile ? C.text : C.muted,
                cursor: isFile ? "pointer" : "default",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  background: isFile ? LANG_COLORS[node.lang || ""] || C.muted : "transparent",
                  border: isFile ? "none" : `1px solid ${C.muted}`,
                  marginRight: 10,
                  flexShrink: 0,
                }}
              />
              {node.name}
              {isFile && (
                <span style={{ marginLeft: "auto", color: C.muted, fontSize: 10 }}>
                  {node.loc}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* treemap */}
      <div style={{ padding: 24, overflow: "hidden" }}>
        <div
          style={{
            ...mono,
            fontSize: 11,
            color: C.muted,
            letterSpacing: "0.08em",
            marginBottom: 14,
          }}
        >
          TREEMAP · SIZED BY LOC
        </div>
        <div style={{ position: "relative", width: 560, height: 480 }}>
          {rects.map((r) => {
            const active = r.item.name === sel;
            return (
              <button
                key={r.item.name}
                onClick={() => setSel(r.item.name)}
                style={{
                  position: "absolute",
                  left: r.x + 1,
                  top: r.y + 1,
                  width: r.w - 2,
                  height: r.h - 2,
                  background: LANG_COLORS[r.item.lang] || C.muted,
                  border: active ? `2px solid ${C.accent}` : "none",
                  cursor: "pointer",
                  padding: 6,
                  textAlign: "left",
                  overflow: "hidden",
                  color: "#0008",
                  ...mono,
                  fontSize: 10,
                }}
                title={`${r.item.name} · ${r.item.loc} loc`}
              >
                <div style={{ color: "#fff", mixBlendMode: "difference" }}>
                  {r.item.name}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* details */}
      <div
        style={{
          borderLeft: `1px solid ${C.border}`,
          padding: 24,
          overflow: "auto",
        }}
      >
        <div
          style={{
            ...mono,
            fontSize: 11,
            color: C.muted,
            letterSpacing: "0.08em",
            marginBottom: 14,
          }}
        >
          FILE DETAILS
        </div>
        <div style={{ ...mono, fontSize: 13, marginBottom: 4 }}>{selected.name}</div>
        <div style={{ ...mono, fontSize: 11, color: C.muted, marginBottom: 24 }}>
          src/scanner/{selected.name}
        </div>

        <Row label="Language">
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 8,
              borderRadius: 4,
              background: LANG_COLORS[selected.lang],
              marginRight: 8,
              verticalAlign: "middle",
            }}
          />
          {selected.lang}
        </Row>
        <Row label="Size">{(selected.loc * 38).toLocaleString()} bytes</Row>
        <Row label="Lines">{selected.loc}</Row>
        <Row label="Complexity">
          <span style={{ color: C.accent }}>6.2</span>
        </Row>
        <Row label="Modified">2026-06-07 14:32</Row>

        <div
          style={{
            ...mono,
            fontSize: 10,
            color: C.muted,
            letterSpacing: "0.08em",
            marginTop: 20,
            marginBottom: 8,
          }}
        >
          BREAKDOWN
        </div>
        <div
          style={{
            display: "flex",
            height: 18,
            borderRadius: 2,
            overflow: "hidden",
            border: `1px solid ${C.border}`,
          }}
        >
          <div style={{ width: `${(code / selected.loc) * 100}%`, background: C.accent }} />
          <div style={{ width: `${(comments / selected.loc) * 100}%`, background: "#7c7a8a" }} />
          <div style={{ width: `${(blanks / selected.loc) * 100}%`, background: "#2a2935" }} />
        </div>
        <div
          className="flex justify-between"
          style={{ ...mono, fontSize: 10, color: C.muted, marginTop: 8 }}
        >
          <span>code {code}</span>
          <span>cmt {comments}</span>
          <span>blank {blanks}</span>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex justify-between"
      style={{
        ...mono,
        fontSize: 12,
        padding: "8px 0",
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <span style={{ color: C.muted }}>{label}</span>
      <span>{children}</span>
    </div>
  );
}
