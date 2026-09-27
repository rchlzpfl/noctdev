// src/features/kanban/components/kanban-card.tsx
"use client";

import { useState } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { TaskWithSnippet } from "../actions/kanban";
import { Code2, Trash2 } from "lucide-react";
import Link from "next/link";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

interface KanbanCardProps {
  task: TaskWithSnippet;
  index: number;
  onDelete: (id: string) => void;
}

export function KanbanCard({ task, index, onDelete }: KanbanCardProps) {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`p-3.5 bg-[#16181F] border rounded-xl select-none transition-all group ${
              snapshot.isDragging
                ? "border-[#F59E0B] shadow-xl shadow-black/80 scale-[1.02] bg-[#16181F]/90"
                : "border-[#232733] hover:border-white/20"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <h4 className="text-xs font-medium text-[#F6F6F8] leading-snug">
                {task.title}
              </h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsConfirming(true);
                }}
                className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-opacity p-0.5 cursor-pointer"
                title="Delete Ticket"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>

            {task.description && (
              <p className="text-[11px] text-neutral-400 mt-1.5 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}

            {task.snippet && (
              <div className="mt-3 pt-2.5 border-t border-[#232733]/80 flex items-center justify-between">
                <Link
                  href={`/vault/${task.snippet.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-[#F59E0B]/30 text-[10px] font-mono text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors"
                >
                  <Code2 className="w-3 h-3" />
                  <span className="truncate max-w-[150px]">{task.snippet.title}</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </Draggable>

      <ConfirmDialog
        isOpen={isConfirming}
        title="Delete Kanban Task"
        description={`Are you sure you want to delete "${task.title}"?`}
        confirmText="Delete Ticket"
        onConfirm={() => {
          onDelete(task.id);
          setIsConfirming(false);
        }}
        onCancel={() => setIsConfirming(false)}
      />
    </>
  );
}