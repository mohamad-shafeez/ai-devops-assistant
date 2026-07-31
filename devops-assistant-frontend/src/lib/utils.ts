import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

export function getScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-amber-500";
  return "bg-red-500";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Needs Work";
}

export function getRiskColor(score: number): string {
  if (score <= 30) return "text-emerald-600";
  if (score <= 60) return "text-amber-600";
  return "text-red-600";
}

export function getLanguageColor(lang: string): string {
  const colors: Record<string, string> = {
    TypeScript: "bg-blue-100 text-blue-700 border-blue-200",
    JavaScript: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Python: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Java: "bg-orange-100 text-orange-700 border-orange-200",
    Go: "bg-cyan-100 text-cyan-700 border-cyan-200",
    Rust: "bg-orange-100 text-orange-700 border-orange-200",
    "C#": "bg-purple-100 text-purple-700 border-purple-200",
    PHP: "bg-indigo-100 text-indigo-700 border-indigo-200",
    Ruby: "bg-red-100 text-red-700 border-red-200",
    Swift: "bg-orange-100 text-orange-700 border-orange-200",
    Kotlin: "bg-violet-100 text-violet-700 border-violet-200",
  };
  return colors[lang] || "bg-slate-100 text-slate-700 border-slate-200";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}