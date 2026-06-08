import { useEffect, useState } from "react";
import { Shell, Screen } from "./components/analyzer/Shell";
import { Welcome } from "./components/analyzer/Welcome";
import { Dashboard } from "./components/analyzer/Dashboard";
import { Files } from "./components/analyzer/Files";
import { Graph } from "./components/analyzer/Graph";
import { Export } from "./components/analyzer/Export";

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [progress, setProgress] = useState<number | undefined>(undefined);

  const openFolder = () => {
    setProgress(0);
    setScreen("dashboard");
  };

  useEffect(() => {
    if (progress === undefined) return;
    if (progress >= 100) return;
    const t = setTimeout(() => setProgress((p) => Math.min(100, (p ?? 0) + 8)), 90);
    return () => clearTimeout(t);
  }, [progress]);

  const status =
    progress !== undefined && progress < 100
      ? `scanning… ${progress}%`
      : screen === "welcome"
      ? "idle"
      : "scan complete · ~/projects/codebase-analyzer";

  return (
    <Shell screen={screen} onChange={setScreen} progress={progress} status={status}>
      {screen === "welcome" && <Welcome onOpen={openFolder} />}
      {screen === "dashboard" && <Dashboard />}
      {screen === "files" && <Files />}
      {screen === "graph" && <Graph />}
      {screen === "export" && <Export />}
    </Shell>
  );
}
