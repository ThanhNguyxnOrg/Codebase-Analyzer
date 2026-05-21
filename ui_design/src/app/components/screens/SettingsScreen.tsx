import { Header, PanelHeader } from "./AnalyzeScreen";
import { canUseDirectoryPicker, DEFAULT_IGNORES, SUPPORTED_LANGUAGES } from "../../lib/analysisEngine";
import { detectOS, shellName } from "../../utils/platform";

export function SettingsScreen() {
  const rows = [
    ["Platform", `${detectOS()} · ${navigator.platform}`],
    ["Folder access", canUseDirectoryPicker() ? "File System Access API" : "folder upload fallback"],
    ["Report export", "Markdown download, browser print to PDF"],
    ["Native core", "C++23 CLI, CMake 3.20+"],
    ["Default ignores", DEFAULT_IGNORES.join(", ")],
    ["Shell hint", shellName()],
  ];

  return (
    <div className="h-full overflow-auto bg-[#070a0f]">
      <div className="max-w-[900px] mx-auto px-10 py-10">
        <Header title="Settings" subtitle="Runtime capabilities detected by the app." />

        <div className="rounded-lg border border-[#1f2430] bg-[#0d1117]">
          <PanelHeader label="runtime" right="detected" />
          <div className="divide-y divide-[#161b24]">
            {rows.map(([key, value]) => (
              <div key={key} className="grid grid-cols-[190px_1fr] gap-4 px-4 py-3 text-[13px]">
                <div className="text-[#9ca3af]">{key}</div>
                <div className="font-mono text-[#cbd5e1] break-words">{value}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-[#1f2430] bg-[#0d1117]">
          <PanelHeader label="parsers" right={`${SUPPORTED_LANGUAGES.length} active`} />
          <div className="p-4 flex flex-wrap gap-2">
            {SUPPORTED_LANGUAGES.map((language) => (
              <span key={language} className="text-[11px] font-mono px-2 py-1 rounded-md bg-[#161b24] border border-[#1f2430] text-[#cbd5e1]">
                {language}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-[#1f2430] bg-[#0d1117]">
          <PanelHeader label="about" right="app" />
          <div className="p-4 font-mono text-[12px] text-[#6b7280] space-y-1.5">
            <div>Codebase Analyzer <span className="text-[#cbd5e1]">v1.0.0</span></div>
            <div>Frontend: <span className="text-[#cbd5e1]">React + Vite + Tailwind CSS</span></div>
            <div>User Agent: <span className="text-[#4b5563] text-[10px]">{navigator.userAgent.slice(0, 96)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
