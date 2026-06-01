"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Bot,
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  Activity,
  Brain,
  Puzzle,
  Settings,
  FileText,
  Plus,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

type NavSection = {
  label: string;
  advancedOnly?: boolean;
  items: {
    href: string;
    icon: React.ElementType;
    label: string;
    badge?: string;
    advancedOnly?: boolean;
  }[];
};

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, viewMode, setViewMode, agents, isConnected } = useAppStore();

  const sections: NavSection[] = [
    {
      label: "Chat",
      items: [
        { href: "/chat", icon: MessageSquare, label: "Trò chuyện" },
      ],
    },
    {
      label: "Control",
      advancedOnly: true,
      items: [
        { href: "/", icon: LayoutDashboard, label: "Tổng quan" },
        { href: "/monitor", icon: Activity, label: "Giám sát" },
      ],
    },
    {
      label: "Agent",
      items: [
        { href: "/agents", icon: Bot, label: "Nhân viên AI", badge: String(agents.length || 0) },
        { href: "/projects", icon: FolderKanban, label: "Dự án" },
        { href: "/tasks", icon: ListChecks, label: "Công việc" },
        { href: "/skills", icon: Puzzle, label: "Kỹ năng", advancedOnly: true },
        { href: "/dreaming", icon: Brain, label: "Dreaming", advancedOnly: true },
      ],
    },
    {
      label: "Settings",
      advancedOnly: true,
      items: [
        { href: "/settings", icon: Settings, label: "Cài đặt" },
      ],
    },
  ];

  const [expandedSections, setExpandedSections] = React.useState<Record<string, boolean>>({
    Chat: true,
    Control: true,
    Agent: true,
    Settings: true,
  });

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  return (
    <aside
      className={cn(
        "flex flex-col border-r transition-all duration-200 h-screen",
        "bg-[var(--background)] border-[var(--border)]",
        sidebarCollapsed ? "w-16" : "w-[var(--shell-nav-width)]",
      )}
    >
      {/* Brand Header */}
      <div className="flex h-[var(--shell-topbar)] items-center gap-3 border-b border-[var(--border)] px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--accent)] text-white">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
          </svg>
        </div>
        {!sidebarCollapsed && (
          <div className="flex flex-col">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)]">
              Control
            </span>
            <span className="text-sm font-bold text-[var(--text-strong)]">
              OpenClaw
            </span>
          </div>
        )}
      </div>

      {/* New Session Button */}
      {!sidebarCollapsed && (
        <div className="px-3 pt-3">
          <Link
            href="/chat"
            className="flex items-center justify-center gap-2 w-full rounded-[var(--radius-md)] bg-[var(--accent)] text-white px-4 py-2 text-sm font-medium hover:bg-[var(--accent-hover)] transition-colors"
          >
            <Plus className="h-4 w-4" />
            Phiên mới
          </Link>
        </div>
      )}

      {/* Mode Toggle */}
      {!sidebarCollapsed && (
        <div className="px-3 pt-3">
          <div className="flex rounded-[var(--radius-md)] bg-[var(--bg-accent)] p-0.5">
            <button
              onClick={() => setViewMode("simple")}
              className={cn(
                "flex-1 rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                viewMode === "simple"
                  ? "bg-[var(--card)] text-[var(--text-strong)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]",
              )}
            >
              Đơn giản
            </button>
            <button
              onClick={() => setViewMode("advanced")}
              className={cn(
                "flex-1 rounded-[var(--radius-sm)] px-3 py-1.5 text-xs font-medium transition-all cursor-pointer",
                viewMode === "advanced"
                  ? "bg-[var(--card)] text-[var(--text-strong)] shadow-sm"
                  : "text-[var(--muted)] hover:text-[var(--foreground)]",
              )}
            >
              Đầy đủ
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {sections.map((section) => {
          if (section.advancedOnly && viewMode === "simple") return null;

          const visibleItems = section.items.filter(
            (item) => !item.advancedOnly || viewMode === "advanced",
          );
          if (visibleItems.length === 0) return null;

          const isExpanded = expandedSections[section.label] !== false;

          return (
            <div key={section.label} className="mb-2">
              {!sidebarCollapsed && (
                <button
                  onClick={() => toggleSection(section.label)}
                  className="flex items-center gap-1 w-full px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted)] hover:text-[var(--foreground)] cursor-pointer"
                >
                  {section.label}
                  {isExpanded ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              )}
              {isExpanded &&
                visibleItems.map((item) => {
                  const isActive =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-[var(--accent-subtle)] text-[var(--accent)]"
                          : "text-[var(--muted)] hover:bg-[var(--bg-accent)] hover:text-[var(--foreground)]",
                        sidebarCollapsed && "justify-center px-2",
                      )}
                      title={sidebarCollapsed ? item.label : undefined}
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!sidebarCollapsed && (
                        <span className="flex-1">{item.label}</span>
                      )}
                      {!sidebarCollapsed && item.badge && (
                        <span className="rounded-full bg-[var(--accent)] text-white px-1.5 py-0.5 text-[10px] font-semibold">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--border)] p-3 space-y-2">
        {!sidebarCollapsed && (
          <>
            <Link
              href="#"
              className="flex items-center gap-2 px-2 py-1 text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
            >
              <FileText className="h-3.5 w-3.5" />
              Tài liệu
            </Link>
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[10px] font-mono text-[var(--muted)]">
                VERSION v2026.5.28
              </span>
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  isConnected ? "bg-[var(--ok)]" : "bg-[var(--danger)]",
                )}
              />
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

// Need React import for useState
import React from "react";
