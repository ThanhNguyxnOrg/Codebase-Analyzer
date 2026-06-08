CONTEXT:
You are designing a desktop developer tool called "Codebase Analyzer" — 
it scans local code projects and visualizes metrics like lines of code, 
language distribution, complexity, cost estimates, and dependency relationships.
The app is built with Tauri v2 (Rust backend) with a native-feeling UI.

DESIGN DIRECTION — "Editorial Developer Terminal":
Do NOT create a generic dark glassmorphism dashboard. Instead, follow these 
strict design principles:

1. LAYOUT PHILOSOPHY — "Asymmetric Editorial"
   - Use a narrow vertical toolbar (48px wide, icon-only, left edge) 
     instead of a fat sidebar
   - Main content area uses a CSS grid with UNEQUAL column splits 
     (e.g. 2fr 1fr, or 1fr 3fr) — never symmetric 50/50
   - Whitespace is a feature. Let data breathe. Don't cram.
   - Information hierarchy via SIZE, not color. 
     Important numbers are 48px+, labels are 11px.

2. COLOR — "Muted Monochrome + One Loud Accent"
   - Background: NOT #000000 or #0a0a0a. Use warm dark: #121114 or #14131a
   - Surface cards: #1c1b22 with 1px border #2a2935 (subtle, no glow)
   - Text primary: #e8e6f0 (warm white, not pure white)
   - Text secondary: #7c7a8a
   - ONE accent only: Pick either:
     - Option A: Warm amber #f59e0b (feels crafted, like a woodworking tool)
     - Option B: Teal #14b8a6 (technical but human)
   - NO gradients on cards. NO blur. NO glassmorphism. Clean, flat, matte.
   - Language colors for charts: use the ACTUAL GitHub language colors 
     (Rust = #dea584, Python = #3572A5, TypeScript = #3178c6, etc.)

3. TYPOGRAPHY — "Monospace Headers, Sans Body"
   - Headlines/numbers: JetBrains Mono or IBM Plex Mono (monospace = dev feel)
   - Body/labels: Inter or DM Sans (clean sans-serif)
   - Number displays: tabular-nums, letter-spacing: -0.02em
   - Use UPPERCASE + letter-spacing: 0.08em for small section labels 
     (like "LANGUAGES" or "METRICS")

4. DATA VISUALIZATION — "Minimal Charts"
   - Language distribution: horizontal stacked bar (NOT pie chart — 
     pie charts are hard to read). Each segment is a language color 
     with percentage label
   - Code/Comment/Blank: simple 3-segment stacked bar per language
   - Treemap: rectangles with 2px gap, solid fill (language color), 
     filename overlaid in small white text
   - Dependency graph: nodes as small circles (6-12px), edges as thin 
     curved lines. NO glowing neon edges. Clean, like a research paper figure.
   - Complexity: small inline sparkline or a simple number badge 
     (not a gauge/dial — those look generic)

5. INTERACTION PATTERNS
   - Folder open: native OS file dialog (not a custom dropzone)
   - Scan progress: thin 2px progress bar at very top of window 
     (like YouTube loading bar), not a modal
   - Hover on chart segments: tooltip appears with details
   - Click file in tree: detail slides in from right (not a modal)
   - Keyboard shortcut hints shown as small kbd tags

SCREENS TO DESIGN (1440×900 window):

SCREEN 1: WELCOME
- Minimal. Almost empty.
- Center: project name "Codebase Analyzer" in monospace, small
- Below: a single line "Open a folder to begin" + one button [Open Folder]
- Below button: "Recent Projects" — a flat list of 3-4 paths with 
  small date and file count, looking like terminal history
- NO hero images, no particles, no decorative illustrations
- Feel: like opening a fresh terminal

SCREEN 2: DASHBOARD (after scan completes)
- Top: project path shown as breadcrumb, tiny, top-left
- Left column (wider, ~65%):
  - Large number stack: "47,382" (total LOC) in 48px monospace, 
    with label "lines of code" below in 11px uppercase
  - Below: 3 smaller numbers inline: "892 files" / "12 languages" / "~$340K est."
  - Below: horizontal stacked language bar (full width, 24px tall)
    Each segment colored by GitHub lang color, labels on hover
  - Below: table showing per-language breakdown 
    (Language | Files | Code | Comments | Blanks | %)
    Clean rows, alternating subtle stripe, monospace numbers
- Right column (~35%):
  - Small card: "COMPLEXITY" — average complexity number, 
    small distribution histogram (10 tiny bars)
  - Small card: "COCOMO ESTIMATE" — 
    Effort: 142 person-months
    Time: 18 months  
    Cost: $340,800 (with adjustable $/month input)
  - Small card: "DUPLICATES" — "23 duplicate files found" 
    with a small [View] link

SCREEN 3: FILE EXPLORER
- Left (30%): file tree with indentation, language-colored dot 
  before each filename (not folder icons — just colored dots)
- Center (45%): treemap visualization. Rectangles sized by LOC, 
  colored by language. 2px gaps. Filenames in tiny text. 
  Selected file highlighted with accent border.
- Right (25%): selected file details — 
  path, size, LOC/comments/blanks as a small stacked bar, 
  complexity score, last modified

SCREEN 4: DEPENDENCY GRAPH
- Full canvas, dark background
- Nodes: small circles (8px), colored by language
- Edges: thin (#2a2935) curved lines, directional (small arrowhead)
- Clusters: very subtle background tint grouping related modules
- Top-right floating toolbar: zoom controls, language filter dropdown, 
  search input
- Click node → small panel appears anchored to node showing: 
  filename, imports count, imported-by count, LOC

SCREEN 5: EXPORT
- Simple page. Not fancy.
- Title: "EXPORT REPORT"
- 4 format cards in a row: JSON / CSV / Markdown / HTML
  Each card: format icon + name + file size estimate + [Export] button
- Below: "Export History" — flat list of recent exports with timestamp
- Clean and functional, not decorative

GLOBAL ELEMENTS:
- Toolbar (left edge, 48px wide): 5 icons vertically stacked 
  (home/dashboard/files/graph/export). Active = accent color fill. 
  Others = #7c7a8a outline.
- Window title bar: integrated (frameless window with custom 
  traffic lights / min-max-close)
- Status bar (bottom, 24px): scan status + file count + tiny version number
- NO rounded corners > 6px. Keep everything slightly sharp.
- NO drop shadows. Use borders only for depth.
- NO animations that last > 200ms. Snappy transitions only.

OVERALL MOOD: 
Think "Figma's interface meets a Bloomberg terminal."
A precision instrument, not a toy. Clean, dense, informative.
The kind of tool a senior engineer would respect.
NOT: colorful startup dashboard, NOT: glassmorphism showcase, 
NOT: Material Design clone.
