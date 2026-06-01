"use client";

import { useAppStore } from "@/stores/app-store";

const availableSkills = [
  { id: "web-search", name: "Tìm kiếm Web", description: "Tìm kiếm thông tin trên internet", icon: "🌐" },
  { id: "code-exec", name: "Thực thi code", description: "Chạy code Python, JS, bash", icon: "💻" },
  { id: "memory", name: "Bộ nhớ", description: "Lưu và truy xuất kiến thức", icon: "🧠" },
  { id: "github", name: "GitHub", description: "Quản lý repository, PR, issues", icon: "🐙" },
  { id: "file-ops", name: "Thao tác file", description: "Đọc, ghi, chỉnh sửa files", icon: "📁" },
  { id: "browser", name: "Trình duyệt", description: "Duyệt web, scraping", icon: "🔍" },
  { id: "image-gen", name: "Tạo ảnh", description: "Sinh ảnh từ mô tả", icon: "🎨" },
  { id: "data-analysis", name: "Phân tích dữ liệu", description: "Xử lý và phân tích data", icon: "📊" },
];

export default function SkillsPage() {
  const { agents } = useAppStore();

  const getAgentsWithSkill = (skillId: string) =>
    agents.filter((a) => a.skills?.includes(skillId));

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-strong)]">Kỹ năng</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Quản lý kỹ năng có thể gán cho agents
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {availableSkills.map((skill) => {
          const agentsUsing = getAgentsWithSkill(skill.id);
          return (
            <div
              key={skill.id}
              className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--card)] p-4"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{skill.icon}</span>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-[var(--text-strong)]">{skill.name}</h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{skill.description}</p>
                </div>
              </div>
              {agentsUsing.length > 0 && (
                <div className="flex items-center gap-1 mt-3 pt-3 border-t border-[var(--border)]">
                  <span className="text-[10px] text-[var(--muted)]">Đang dùng:</span>
                  {agentsUsing.slice(0, 3).map((a) => (
                    <span key={a.id} className="text-xs">
                      {a.identity?.emoji || a.emoji || "🤖"}
                    </span>
                  ))}
                  {agentsUsing.length > 3 && (
                    <span className="text-[10px] text-[var(--muted)]">+{agentsUsing.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
