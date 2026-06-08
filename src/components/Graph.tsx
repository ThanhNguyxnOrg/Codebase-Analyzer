import { useState, useMemo } from "react";
import { C, mono, LANG_COLORS } from "./tokens";
import { ZoomIn, ZoomOut, Search } from "lucide-react";
import { useAnalysis } from "../hooks/useAnalysis";

export function Graph() {
  const { summary } = useAnalysis();
  const [selectedLang, setSelectedLang] = useState<string>("All languages");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [zoom, setZoom] = useState<number>(1);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // 1. Get files and filter/slice them to get a reasonable node count (up to 24 nodes to prevent clutter)
  const filesToRender = useMemo(() => {
    if (!summary) return [];
    // Sort by loc to focus on core codebase files, slice to top 24
    let list = [...summary.files];
    if (selectedLang !== "All languages") {
      list = list.filter((f) => f.lang === selectedLang);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((f) => f.path.toLowerCase().includes(q) || f.name.toLowerCase().includes(q));
    }
    return list.sort((a, b) => b.loc - a.loc).slice(0, 24);
  }, [summary, selectedLang, searchQuery]);

  // 2. Generate circular node layout
  const nodes = useMemo(() => {
    const N = filesToRender.length;
    const centerX = 450;
    const centerY = 280;
    const radius = 180;

    return filesToRender.map((f, i) => {
      const angle = (i / N) * 2 * Math.PI;
      return {
        id: f.path,
        name: f.name,
        lang: f.lang,
        loc: f.loc,
        complexity: f.complexity,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }, [filesToRender]);

  // 3. Map actual backend edges
  const edges = useMemo(() => {
    if (!summary || !summary.edges) return [];
    const nodeIds = new Set(nodes.map((n) => n.id));
    
    // Keep only edges that link existing nodes in the current view
    return (summary.edges as [string, string][])
      .filter(([src, dest]: [string, string]) => nodeIds.has(src) && nodeIds.has(dest))
      .map(([src, dest]: [string, string]) => {
        const sourceNode = nodes.find((n) => n.id === src)!;
        const targetNode = nodes.find((n) => n.id === dest)!;
        return {
          source: src,
          target: dest,
          x1: sourceNode.x,
          y1: sourceNode.y,
          x2: targetNode.x,
          y2: targetNode.y,
        };
      });
  }, [summary, nodes]);

  // Set default selection to the first node if any exists
  useMemo(() => {
    if (nodes.length > 0 && (!selectedNodeId || !nodes.find((n) => n.id === selectedNodeId))) {
      setSelectedNodeId(nodes[0].id);
    }
  }, [nodes, selectedNodeId]);

  const selectedNode = useMemo(() => {
    return nodes.find((n) => n.id === selectedNodeId) || null;
  }, [nodes, selectedNodeId]);

  const incomingEdgesCount = useMemo(() => {
    return edges.filter((e: { target: string }) => e.target === selectedNodeId).length;
  }, [edges, selectedNodeId]);

  const outgoingEdgesCount = useMemo(() => {
    return edges.filter((e: { source: string }) => e.source === selectedNodeId).length;
  }, [edges, selectedNodeId]);

  if (!summary) {
    return (
      <div className="size-full flex items-center justify-center text-zinc-500" style={mono}>
        No scan data available.
      </div>
    );
  }

  return (
    <div style={{ height: "100%", position: "relative", background: C.bg }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 900 560"
        style={{
          transform: `scale(${zoom})`,
          transition: "transform 200ms ease-out",
          transformOrigin: "center center",
        }}
      >
        {/* Render edges */}
        {edges.map((e: { source: string; target: string; x1: number; y1: number; x2: number; y2: number }, idx: number) => {
          const isActive = selectedNodeId && (e.source === selectedNodeId || e.target === selectedNodeId);
          const mx = (e.x1 + e.x2) / 2;
          const my = (e.y1 + e.y2) / 2 - 15;
          return (
            <g key={idx}>
              <path
                d={`M ${e.x1} ${e.y1} Q ${mx} ${my} ${e.x2} ${e.y2}`}
                stroke={isActive ? C.accent : C.border}
                strokeWidth={isActive ? 1.5 : 0.8}
                fill="none"
                opacity={isActive ? 1.0 : 0.35}
              />
            </g>
          );
        })}

        {/* Render nodes */}
        {nodes.map((n) => {
          const isActive = n.id === selectedNodeId;
          return (
            <g
              key={n.id}
              style={{ cursor: "pointer" }}
              onClick={() => setSelectedNodeId(n.id)}
            >
              <circle
                cx={n.x}
                cy={n.y}
                r={isActive ? 10 : 7}
                fill={LANG_COLORS[n.lang] || C.muted}
                stroke={isActive ? C.accent : "transparent"}
                strokeWidth={2.5}
              />
              <text
                x={n.x + 12}
                y={n.y + 4}
                fill={isActive ? C.text : C.muted}
                style={{ ...mono, fontSize: 10, pointerEvents: "none" }}
              >
                {n.name}
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
        <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} style={iconBtn} title="Zoom Out">
          <ZoomOut size={14} color={C.muted} />
        </button>
        <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))} style={iconBtn} title="Zoom In">
          <ZoomIn size={14} color={C.muted} />
        </button>
        <div style={{ width: 1, height: 18, background: C.border }} />
        <select
          value={selectedLang}
          onChange={(e) => setSelectedLang(e.target.value)}
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
          {summary.languages.map((l) => (
            <option key={l.name} value={l.name}>
              {l.name}
            </option>
          ))}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
      {selectedNode && (
        <div
          className="absolute"
          style={{
            left: 24,
            bottom: 24,
            background: C.surface,
            border: `1px solid ${C.border}`,
            borderRadius: 4,
            padding: 14,
            minWidth: 280,
            maxWidth: 400,
          }}
        >
          <div style={{ ...mono, fontSize: 12, marginBottom: 10, wordBreak: "break-all" }}>{selectedNode.name}</div>
          <Stat label="FULL PATH" value={selectedNode.id} />
          <Stat label="LANGUAGE" value={selectedNode.lang} color={LANG_COLORS[selectedNode.lang]} />
          <Stat label="IMPORTS" value={String(outgoingEdgesCount)} />
          <Stat label="IMPORTED BY" value={String(incomingEdgesCount)} />
          <Stat label="LOC" value={String(selectedNode.loc)} />
          <Stat label="COMPLEXITY" value={selectedNode.complexity.toFixed(1)} />
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
    <div className="flex justify-between gap-4" style={{ padding: "4px 0" }}>
      <span style={{ ...mono, fontSize: 10, color: C.muted, letterSpacing: "0.08em" }}>
        {label}
      </span>
      <span style={{ ...mono, fontSize: 11, color: C.text, textAlign: "right", wordBreak: "break-all" }}>
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
