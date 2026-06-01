"use client";

import { ThemeProvider } from "next-themes";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="flex h-screen overflow-hidden bg-[var(--background)]">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </ThemeProvider>
  );
}
