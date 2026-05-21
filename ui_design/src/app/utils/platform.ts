// Detect the user's OS from the browser's navigator
export function detectOS(): "windows" | "macos" | "linux" {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes("win")) return "windows";
  if (ua.includes("mac")) return "macos";
  return "linux";
}

// Return the correct modifier key label for the detected OS
export function modKey(): string {
  return detectOS() === "macos" ? "⌘" : "Ctrl";
}

// Format a shortcut string like "Ctrl+O" or "⌘O" depending on OS
export function shortcut(key: string): string {
  return `${modKey()}+${key}`;
}

// Get a terminal shell name appropriate for the OS
export function shellName(): string {
  const os = detectOS();
  if (os === "windows") return "pwsh";
  if (os === "macos") return "zsh";
  return "bash";
}

// Format current time as HH:MM
export function clockNow(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Format current time as HH:MM:SS
export function clockNowSec(): string {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}
