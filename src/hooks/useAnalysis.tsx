import React, { createContext, useContext, useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { ProjectSummary, CocomoResult } from "../types";

interface RecentProject {
  path: string;
  date: string;
  files: number;
}

interface AnalysisContextType {
  summary: ProjectSummary | null;
  loading: boolean;
  progress: number;
  error: string | null;
  cocomoRate: number;
  setCocomoRate: (rate: number) => void;
  cocomo: CocomoResult | null;
  recentProjects: RecentProject[];
  scanFolder: (path: string) => Promise<void>;
  selectFolderAndScan: () => Promise<void>;
  exportSummaryReport: (filePath: string, format: string) => Promise<void>;
  resetAnalysis: () => void;
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined);

export function AnalysisProvider({ children }: { children: React.ReactNode }) {
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [cocomoRate, setCocomoRate] = useState<number>(2400); // Default multiplier ($2,400)
  const [cocomo, setCocomo] = useState<CocomoResult | null>(null);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);

  // Load recent projects on mount
  useEffect(() => {
    const saved = localStorage.getItem("cb_analyzer_recents");
    if (saved) {
      try {
        setRecentProjects(JSON.parse(saved));
      } catch (_) {
        // Clear corrupt storage
        localStorage.removeItem("cb_analyzer_recents");
      }
    }
  }, []);

  // Update COCOMO estimates dynamically when summary or rate changes
  useEffect(() => {
    if (!summary) {
      setCocomo(null);
      return;
    }
    
    // Invoke the Rust COCOMO estimation command
    invoke<CocomoResult>("get_cocomo_estimate", {
      loc: summary.totalLoc,
      monthlyRateUsd: cocomoRate * 1000.0,
    })
      .then((res) => setCocomo(res))
      .catch((err) => console.error("Failed to calculate COCOMO estimate:", err));
  }, [summary, cocomoRate]);

  // Perform codebase scan on path
  const scanFolder = async (folderPath: string) => {
    setLoading(true);
    setProgress(0);
    setError(null);

    // Dynamic progress bar emulation for scanning UI
    const progressTimer = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        return p + Math.floor(Math.random() * 10) + 2;
      });
    }, 150);

    try {
      const result = await invoke<ProjectSummary>("scan_directory", { path: folderPath });
      clearInterval(progressTimer);
      setProgress(100);
      setSummary(result);

      // Save to recent projects
      const updatedRecents = [
        {
          path: folderPath,
          date: new Date().toISOString().replace("T", " ").substring(0, 16),
          files: result.totalFiles,
        },
        ...recentProjects.filter((p) => p.path !== folderPath),
      ].slice(0, 5); // Limit to 5 entries

      setRecentProjects(updatedRecents);
      localStorage.setItem("cb_analyzer_recents", JSON.stringify(updatedRecents));
    } catch (err: any) {
      clearInterval(progressTimer);
      setError(err?.toString() || "An unknown error occurred during scan.");
      setProgress(0);
    } finally {
      setLoading(false);
    }
  };

  // Open native system folder picker dialog and start scan
  const selectFolderAndScan = async () => {
    try {
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Project Directory for Analysis",
      });

      if (selected && typeof selected === "string") {
        await scanFolder(selected);
      }
    } catch (err: any) {
      setError(err?.toString() || "Failed to open folder picker.");
    }
  };

  // Export report via Rust file writer
  const exportSummaryReport = async (filePath: string, format: string) => {
    if (!summary) throw new Error("No scan data available to export.");
    await invoke("export_report", {
      path: filePath,
      format,
      summary,
    });
  };

  const resetAnalysis = () => {
    setSummary(null);
    setError(null);
    setProgress(0);
  };

  return (
    <AnalysisContext.Provider
      value={{
        summary,
        loading,
        progress,
        error,
        cocomoRate,
        setCocomoRate,
        cocomo,
        recentProjects,
        scanFolder,
        selectFolderAndScan,
        exportSummaryReport,
        resetAnalysis,
      }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

export function useAnalysis() {
  const context = useContext(AnalysisContext);
  if (context === undefined) {
    throw new Error("useAnalysis must be used within an AnalysisProvider");
  }
  return context;
}
