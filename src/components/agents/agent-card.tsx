"use client";

import Link from "next/link";
import { MessageSquare, BookOpen, Settings, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AgentSummary } from "@/lib/openclaw-client";

export function AgentCard({
  agent,
  onDelete,
}: {
  agent: AgentSummary;
  onDelete?: (id: string) => void;
}) {
  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md hover:border-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-blue-800">
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-lg dark:from-blue-900/30 dark:to-indigo-900/30">
            {agent.identity?.emoji ?? agent.emoji ?? "🤖"}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {agent.identity?.name ?? agent.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {agent.model?.primary ?? "No model configured"}
            </p>
          </div>
        </div>
        <Badge variant="success" className="text-[10px]">Active</Badge>
      </div>

      {/* Model & Skills */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {agent.model?.fallbacks?.map((f) => (
          <Badge key={f} variant="secondary" className="text-[10px]">
            Fallback: {f}
          </Badge>
        ))}
        {agent.skills?.map((s) => (
          <Badge key={s} variant="outline" className="text-[10px]">
            {s}
          </Badge>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 border-t border-gray-100 pt-3 dark:border-gray-700">
        <Link href={`/agents/${agent.id}`}>
          <Button variant="ghost" size="sm" className="text-xs gap-1.5">
            <Settings className="h-3.5 w-3.5" />
            Config
          </Button>
        </Link>
        <Link href={`/knowledge?agent=${agent.id}`}>
          <Button variant="ghost" size="sm" className="text-xs gap-1.5">
            <BookOpen className="h-3.5 w-3.5" />
            Knowledge
          </Button>
        </Link>
        <Button variant="ghost" size="sm" className="text-xs gap-1.5" onClick={() => {}}>
          <MessageSquare className="h-3.5 w-3.5" />
          Chat
        </Button>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={() => onDelete?.(agent.id)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
