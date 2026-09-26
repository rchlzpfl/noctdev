// src/features/kanban/components/kanban-board.tsx
"use client";

import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { TaskStatus, Snippet } from "@/types/database.types";
import {
  TaskWithSnippet,
  updateTaskStatus,
  deleteKanbanTask,
  createKanbanTask,
} from "../actions/kanban";
import { KanbanColumn } from "./kanban-column";
import { Plus } from "lucide-react";

const COLUMNS: { id: TaskStatus; title: string; badgeColor: string }[] = [
  { id: "todo", title: "To Do", badgeColor: "#9499A8" },
  { id: "in_progress", title: "In Progress", badgeColor: "#F59E0B" },
  { id: "done", title: "Done", badgeColor: "#34D399" },
];

interface KanbanBoardProps {
  initialTasks: TaskWithSnippet[];
  availableSnippets: Snippet[];
}

export function KanbanBoard({ initialTasks, availableSnippets }: KanbanBoardProps) {
  const [mounted, setMounted] = useState(false);
  const [tasks, setTasks] = useState<TaskWithSnippet[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [snippetId, setSnippetId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Prevent SSR hydration mismatch with drag & drop
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceStatus = source.droppableId as TaskStatus;
    const destStatus = destination.droppableId as TaskStatus;

    // Optimistic UI Update
    setTasks((prev) => {
      const cloned = [...prev];
      const taskIndex = cloned.findIndex((t) => t.id === draggableId);
      if (taskIndex === -1) return prev;

      cloned[taskIndex] = {
        ...cloned[taskIndex],
        status: destStatus,
        order_index: destination.index,
      };

      return cloned;
    });

    // Database Sync
    await updateTaskStatus(draggableId, destStatus, destination.index);
  };

  const handleDeleteTask = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await deleteKanbanTask(id);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || submitting) return;

    try {
      setSubmitting(true);
      const newTask = await createKanbanTask({
        title: title.trim(),
        description: desc.trim() || undefined,
        status,
        snippet_id: snippetId || undefined,
      });

      setTasks((prev) => [...prev, newTask]);
      setTitle("");
      setDesc("");
      setSnippetId("");
      setIsModalOpen(false);
    } catch (err) {
      alert("Error adding task: " + (err as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6">
      {/* Board Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-[#F6F6F8]">Kanban Taskboard</h1>
          <p className="text-xs text-neutral-400 mt-1">
            Organize development flow and attach multi-file Snippets directly to tickets.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-[#F59E0B] hover:bg-[#F59E0B]/90 text-[#0B0C10] font-semibold text-xs rounded-lg transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Drag & Drop Columns */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              id={col.id}
              title={col.title}
              badgeColor={col.badgeColor}
              tasks={tasks.filter((t) => t.status === col.id)}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>
      </DragDropContext>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateTask}
            className="w-full max-w-md bg-[#16181F] border border-[#232733] rounded-xl p-6 space-y-4 shadow-2xl"
          >
            <h2 className="text-base font-bold text-[#F6F6F8]">Create New Task</h2>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400">Title</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="e.g. Implement webhook retry queue"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] focus:border-[#F59E0B]/60 rounded-lg text-[#F6F6F8] outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-mono text-neutral-400">Description</label>
              <textarea
                rows={3}
                placeholder="Technical notes, acceptance criteria..."
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] focus:border-[#F59E0B]/60 rounded-lg text-[#F6F6F8] outline-none resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-neutral-400">Initial Column</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] rounded-lg text-[#F6F6F8] outline-none"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-mono text-neutral-400">Attach Snippet</label>
                <select
                  value={snippetId}
                  onChange={(e) => setSnippetId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#0B0C10] border border-[#232733] rounded-lg text-[#F6F6F8] outline-none"
                >
                  <option value="">None</option>
                  {availableSnippets.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-[#F59E0B] text-[#0B0C10] font-semibold text-xs rounded-lg hover:bg-[#F59E0B]/90 disabled:opacity-50"
              >
                {submitting ? "Adding..." : "Add Ticket"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}