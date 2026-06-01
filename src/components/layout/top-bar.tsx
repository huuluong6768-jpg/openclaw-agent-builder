"use client";

import { usePathname } from "next/navigation";
import { Search, Sun, Moon, User } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const pathLabels: Record<string, string> = {
  "/": "Tổng quan",
  "/chat": "Trò chuyện",
  "/agents": "Nhân viên AI",
  "/projects": "Dự án",
  "/tasks": "Công việc",
  "/monitor": "Giám sát",
  "/skills": "Kỹ năng",
  "/dreaming": "Dreaming",
  "/settings": "Cài đặt",
  "/knowledge": "Kiến thức",
};

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export function TopBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const currentLabel = Object.entries(pathLabels).find(
    ([path]) => (path === "/" ? pathname === "/" : pathname.startsWith(path)),
  )?.[1] || "Trang";

  return (
    <header className="flex h-[var(--shell-topbar)] items-center justify-between border-b border-[var(--border)] bg-[var(--background)] px-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm">
        <span className="text-[var(--accent)] font-medium">OpenClaw</span>
        <span className="text-[var(--muted)]">›</span>
        <span className="text-[var(--muted)]">main</span>
        <span className="text-[var(--muted)]">›</span>
        <span className="text-[var(--text-strong)] font-medium">{currentLabel}</span>
      </nav>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <button className="flex items-center gap-2 rounded-[var(--radius-sm)] border border-[var(--border)] bg-[var(--bg-accent)] px-3 py-1.5 text-xs text-[var(--muted)] hover:border-[var(--border-strong)] transition-colors cursor-pointer">
          <Search className="h-3.5 w-3.5" />
          <span>Tìm kiếm</span>
          <kbd className="ml-2 rounded border border-[var(--border)] bg-[var(--background)] px-1 py-0.5 text-[10px] font-mono">
            ⌘K
          </kbd>
        </button>

        {/* Theme Toggle */}
        {mounted && (
          <div className="flex rounded-[var(--radius-sm)] border border-[var(--border)] overflow-hidden">
            <button
              onClick={() => setTheme("light")}
              className={`p-1.5 cursor-pointer ${theme === "light" ? "bg-[var(--accent-subtle)] text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              title="Sáng"
            >
              <Sun className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setTheme("dark")}
              className={`p-1.5 cursor-pointer ${theme === "dark" ? "bg-[var(--accent-subtle)] text-[var(--accent)]" : "text-[var(--muted)] hover:text-[var(--foreground)]"}`}
              title="Tối"
            >
              <Moon className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* User */}
        <button className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-accent)] text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer">
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
