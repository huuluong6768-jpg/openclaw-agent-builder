"use client";

import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/": "Chat - Agent Builder",
  "/agents": "Agents",
  "/knowledge": "Knowledge Injection",
  "/skills": "Skills",
  "/settings": "Settings",
};

export function TopBar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  const title = pageTitles[pathname] ?? "Agent Builder";

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-800 dark:bg-gray-950">
      <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title="Toggle theme"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  );
}
