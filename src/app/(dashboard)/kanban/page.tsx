// src/app/(dashboard)/kanban/page.tsx
import { getKanbanTasks } from "@/features/kanban/actions/kanban";
import { getUserSnippets } from "@/features/snippets/actions/snippets";
import { KanbanBoard } from "@/features/kanban/components/kanban-board";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  const [tasks, snippets] = await Promise.all([
    getKanbanTasks(),
    getUserSnippets(),
  ]);

  return (
    <div className="p-8 max-w-7xl mx-auto h-[calc(100vh-64px)] flex flex-col">
      <KanbanBoard initialTasks={tasks} availableSnippets={snippets} />
    </div>
  );
}