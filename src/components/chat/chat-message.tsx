"use client";

import { Bot, User, Check, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ChatMessage as ChatMessageType } from "@/stores/app-store";

export function ChatMessage({
  message,
  onAction,
}: {
  message: ChatMessageType;
  onAction?: (action: string) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 animate-message-in", isUser ? "flex-row-reverse" : "flex-row")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-blue-600 text-white"
            : "bg-gradient-to-br from-blue-500 to-indigo-600 text-white",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>

      {/* Content */}
      <div className={cn("flex max-w-[80%] flex-col gap-2", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-900 shadow-sm border border-gray-100 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-700",
          )}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Agent config preview */}
        {message.agentConfig && (
          <div className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Agent Configuration
            </div>
            <div className="space-y-1.5 text-sm">
              {message.agentConfig.name && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Name:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {message.agentConfig.emoji} {message.agentConfig.name}
                  </span>
                </div>
              )}
              {message.agentConfig.model?.primary && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Model:</span>
                  <Badge>{message.agentConfig.model.primary}</Badge>
                </div>
              )}
              {message.agentConfig.model?.fallbacks && message.agentConfig.model.fallbacks.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Fallback:</span>
                  <div className="flex gap-1">
                    {message.agentConfig.model.fallbacks.map((f) => (
                      <Badge key={f} variant="secondary">{f}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {message.agentConfig.skills && message.agentConfig.skills.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Skills:</span>
                  <div className="flex gap-1">
                    {message.agentConfig.skills.map((s) => (
                      <Badge key={s} variant="outline">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Progress */}
        {message.progress && (
          <div className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="space-y-2">
              {message.progress.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {step.status === "done" && <Check className="h-4 w-4 text-green-500" />}
                  {step.status === "loading" && <Loader2 className="h-4 w-4 animate-spin text-blue-500" />}
                  {step.status === "pending" && <Circle className="h-4 w-4 text-gray-300 dark:text-gray-600" />}
                  <span
                    className={cn(
                      step.status === "done" && "text-green-700 dark:text-green-400",
                      step.status === "loading" && "text-blue-700 dark:text-blue-400 font-medium",
                      step.status === "pending" && "text-gray-400 dark:text-gray-500",
                    )}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action buttons */}
        {message.actions && (
          <div className="flex gap-2">
            {message.actions.map((a) => (
              <Button
                key={a.action}
                size="sm"
                variant={a.action === "confirm" ? "default" : "outline"}
                onClick={() => onAction?.(a.action)}
              >
                {a.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
