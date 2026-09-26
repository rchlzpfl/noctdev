// src/features/kanban/components/kanban-column.tsx
"use client";

import { Droppable } from "@hello-pangea/dnd";
import { TaskStatus } from "@/types/database.types";
import { TaskWithSnippet } from "../actions/kanban";
import { KanbanCard } from "./kanban-card";

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  badgeColor: string;
  tasks: TaskWithSnippet[];
  onDeleteTask: (id: string) => void;
}

export function KanbanColumn({
  id,
  title,
  badgeColor,
  tasks,
  onDeleteTask,
}: KanbanColumnProps) {
  return (
    <div className="w-80 flex flex-col shrink-0 bg-[#0B0C10] border border-[#232733] rounded-2xl max-h-full">
      {/* Column Header */}
      <div className="p-4 border-b border-[#232733] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: badgeColor }}
          />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#F6F6F8]">
            {title}
          </h3>
        </div>
        <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-[#16181F] border border-white/5 text-neutral-400">
          {tasks.length}
        </span>
      </div>

      {/* Droppable Card Area */}
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 space-y-2.5 transition-colors rounded-b-2xl min-h-[150px] ${
              snapshot.isDraggingOver ? "bg-[#16181F]/40" : ""
            }`}
          >
            {tasks.map((task, index) => (
              <KanbanCard
                key={task.id}
                task={task}
                index={index}
                onDelete={onDeleteTask}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}