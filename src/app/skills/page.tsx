"use client";

import { useState } from "react";
import { Search, Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type Skill = {
  id: string;
  name: string;
  description: string;
  installed: boolean;
  agents: string[];
  rating?: number;
};

const mockSkills: Skill[] = [
  { id: "web-search", name: "Web Search", description: "Search the web for information", installed: true, agents: ["Marketing Writer", "Research Agent"], rating: 4.8 },
  { id: "github", name: "GitHub", description: "Interact with GitHub repositories", installed: true, agents: ["Code Reviewer"], rating: 4.5 },
  { id: "memory", name: "Memory", description: "Long-term memory management", installed: true, agents: ["Research Agent"], rating: 4.7 },
  { id: "email", name: "Email", description: "Send and read emails", installed: false, agents: [], rating: 4.2 },
  { id: "calendar", name: "Calendar", description: "Manage calendar events", installed: false, agents: [], rating: 4.0 },
  { id: "database", name: "Database", description: "Query and manage databases", installed: false, agents: [], rating: 4.6 },
];

export default function SkillsPage() {
  const [search, setSearch] = useState("");
  const [skills, setSkills] = useState(mockSkills);

  const installed = skills.filter((s) => s.installed);
  const available = skills.filter((s) => !s.installed && s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Skills</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage installed skills and browse ClawHub
        </p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search skills on ClawHub..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Installed */}
      <section className="mb-8">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Installed Skills ({installed.length})
        </h3>
        <div className="space-y-2">
          {installed.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  {skill.id === "web-search" ? "🌐" : skill.id === "github" ? "🐙" : skill.id === "memory" ? "🧠" : "🧩"}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{skill.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{skill.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {skill.agents.map((a) => (
                    <Badge key={a} variant="secondary" className="text-[10px]">{a}</Badge>
                  ))}
                </div>
                <Badge variant="success">Enabled</Badge>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse */}
      <section>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Browse ClawHub
        </h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {available.map((skill) => (
            <div
              key={skill.id}
              className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100 text-lg dark:bg-gray-700">
                  {skill.id === "email" ? "📧" : skill.id === "calendar" ? "📅" : "🗄️"}
                </div>
                {skill.rating && (
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    ★ {skill.rating}
                  </span>
                )}
              </div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{skill.name}</h4>
              <p className="mb-3 text-xs text-gray-500 dark:text-gray-400">{skill.description}</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-2"
                onClick={() => {
                  setSkills(skills.map((s) =>
                    s.id === skill.id ? { ...s, installed: true } : s,
                  ));
                }}
              >
                <Download className="h-3.5 w-3.5" />
                Install
              </Button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
