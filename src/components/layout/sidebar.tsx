"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MessageSquare,
  Bot,
  BookOpen,
  Puzzle,
  Settings,
  Share2,
  ChevronLeft,
  ChevronRight,
  Wifi,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";

const navItems = [
  { href: "/", icon: MessageSquare, label: "Chat" },
  { href: "/agents", icon: Bot, label: "Agents" },
  { href: "/knowledge", icon: BookOpen, label: "Knowledge" },
  { href: "/skills", icon: Puzzle, label: "Skills" },
  { href: "/integrations", icon: Share2, label: "Integrations" },
  { href: "/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, isConnected } = useAppStore();

  return (
    <aside
      className={cn(
        "flex flex-col border-r border-gray-200 bg-white transition-all duration-200 dark:border-gray-800 dark:bg-gray-950",
        sidebarCollapsed ? "w-16" : "w-60",
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-gray-200 px-4 dark:border-gray-800">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-sm font-bold">
          AB
        </div>
        {!sidebarCollapsed && (
          <span className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            Agent Builder
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-2">
        {navItems.map((item) => {
          const isActive = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200",
                sidebarCollapsed && "justify-center px-2",
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="space-y-2 border-t border-gray-200 p-2 dark:border-gray-800">
        {/* Connection status */}
        <div
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-xs",
            sidebarCollapsed && "justify-center px-2",
          )}
        >
          {isConnected ? (
            <Wifi className="h-4 w-4 text-green-500 shrink-0" />
          ) : (
            <WifiOff className="h-4 w-4 text-red-500 shrink-0" />
          )}
          {!sidebarCollapsed && (
            <span className={cn("text-xs", isConnected ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400")}>
              {isConnected ? "Connected" : "Disconnected"}
            </span>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-4 w-4 mx-auto" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
