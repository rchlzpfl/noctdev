// src/lib/hooks/use-cached-data.ts
import useSWR, { mutate } from "swr";
import { getUserSnippets, getSnippetById } from "@/features/snippets/actions/snippets";
import { getKanbanTasks } from "@/features/kanban/actions/kanban";
import { getGotchas } from "@/features/gotchas/actions/gotchas";

export function useSnippets() {
  const { data, error, isLoading, isValidating } = useSWR(
    "user-snippets",
    async () => await getUserSnippets(),
    {
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  return {
    snippets: data || [],
    loading: isLoading && !data,
    isValidating,
    error,
    refreshSnippets: () => mutate("user-snippets"),
  };
}

export function useSnippet(id: string | null) {
  const { data, error, isLoading, isValidating } = useSWR(
    id ? `snippet-${id}` : null,
    async () => {
      if (!id) return null;
      return await getSnippetById(id);
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 15000,
    }
  );

  return {
    snippetData: data,
    loading: isLoading && !data,
    isValidating,
    error,
    refreshSnippet: () => mutate(id ? `snippet-${id}` : null),
  };
}

export function useKanbanTasks() {
  const { data, error, isLoading, isValidating } = useSWR(
    "kanban-tasks",
    async () => await getKanbanTasks(),
    {
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  return {
    kanbanData: data || { tasks: [], snippets: [] },
    loading: isLoading && !data,
    isValidating,
    error,
    refreshKanban: () => mutate("kanban-tasks"),
  };
}

export function useGotchas() {
  const { data, error, isLoading, isValidating } = useSWR(
    "user-gotchas",
    async () => await getGotchas(),
    {
      revalidateOnFocus: true,
      dedupingInterval: 10000,
    }
  );

  return {
    gotchas: data || [],
    loading: isLoading && !data,
    isValidating,
    error,
    refreshGotchas: () => mutate("user-gotchas"),
  };
}

export { mutate };
