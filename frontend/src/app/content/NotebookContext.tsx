"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

// ── Types ──────────────────────────────────────────────────────────────────

interface NotebookContextValue {
  selectedNotebookId: string | null;
  selectNotebook: (id: string | null) => void;
}

// ── Context ────────────────────────────────────────────────────────────────

const NotebookContext = createContext<NotebookContextValue>({
  selectedNotebookId: null,
  selectNotebook: () => {},
});

// ── Provider ───────────────────────────────────────────────────────────────

export function NotebookProvider({ children }: { children: ReactNode }) {
  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null);

  return (
    <NotebookContext.Provider
      value={{
        selectedNotebookId,
        selectNotebook: setSelectedNotebookId,
      }}
    >
      {children}
    </NotebookContext.Provider>
  );
}

export const useNotebookContext = () => useContext(NotebookContext);