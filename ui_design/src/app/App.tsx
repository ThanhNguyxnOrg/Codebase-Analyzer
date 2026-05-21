import { useState, useEffect, useCallback } from "react";
import { TitleBar } from "./components/TitleBar";
import { Sidebar, type Screen } from "./components/Sidebar";
import { HomeScreen } from "./components/screens/HomeScreen";
import { AnalyzeScreen } from "./components/screens/AnalyzeScreen";
import { DashboardScreen } from "./components/screens/DashboardScreen";
import { FilesScreen } from "./components/screens/FilesScreen";
import { ReportScreen } from "./components/screens/ReportScreen";
import { SettingsScreen } from "./components/screens/SettingsScreen";
import { AnalysisProvider, useAnalysis } from "./context/AnalysisContext";
import { GitBranch, Circle, Wifi } from "lucide-react";
import { clockNow } from "./utils/platform";

function AppInner() {
  const [screen, setScreen] = useState<Screen>("home");
  const { analyzing, projectPath, repositorySnapshot, result } = useAnalysis();

  // ── Global keyboard shortcuts ────────────────────────────────────
  const handleKey = useCallback((e: KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey;
    if (!mod) return;
    const map: Record<string, Screen> = {
      "1": "home", "2": "analyze", "3": "dashboard",
      "4": "files", "5": "report", ",": "settings",
    };
    const target = map[e.key];
    if (target) { e.preventDefault(); setScreen(target); }
    if (e.key === "o" || e.key === "O") { e.preventDefault(); setScreen("analyze"); }
    if (e.key === "r" || e.key === "R") { e.preventDefault(); setScreen("analyze"); }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  return (
    <div className="size-full bg-[#070a0f] text-[#e5e7eb] font-sans">
      <div className="w-full h-full flex flex-col bg-[#0a0d12]">
        <TitleBar path={projectPath} />
        <div className="flex-1 flex min-h-0">
          <Sidebar active={screen} onChange={setScreen} analyzing={analyzing} />
          <main className="flex-1 min-w-0 flex flex-col bg-[#070a0f]">
            <div className="flex-1 min-h-0">
              {screen === "home" && <HomeScreen onAnalyze={() => setScreen("analyze")} onDashboard={() => setScreen("dashboard")} />}
              {screen === "analyze" && <AnalyzeScreen onComplete={() => setScreen("dashboard")} />}
              {screen === "dashboard" && <DashboardScreen />}
              {screen === "files" && <FilesScreen />}
              {screen === "report" && <ReportScreen />}
              {screen === "settings" && <SettingsScreen />}
            </div>
            <StatusBar screen={screen} branch={repositorySnapshot.gitBranch} hasResult={Boolean(result)} />
          </main>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AnalysisProvider>
      <AppInner />
    </AnalysisProvider>
  );
}

function StatusBar({ screen, branch, hasResult }: { screen: Screen; branch: string; hasResult: boolean }) {
  const [time, setTime] = useState(clockNow());
  useEffect(() => {
    const id = setInterval(() => setTime(clockNow()), 10_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="h-6 shrink-0 border-t border-[#1f2430] bg-[#0a0d12] flex items-center justify-between px-3 text-[10px] font-mono text-[#6b7280]">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1"><GitBranch size={10} /> {branch}</span>
        <span>{hasResult ? "analysis loaded" : "no analysis"}</span>
      </div>
      <div className="flex items-center gap-3">
        <span>route: /{screen}</span>
        <span className="flex items-center gap-1"><Circle size={6} className="fill-emerald-400 text-emerald-400" /> connected</span>
        <span className="flex items-center gap-1"><Wifi size={10} /> local</span>
        <span>{time}</span>
      </div>
    </div>
  );
}
