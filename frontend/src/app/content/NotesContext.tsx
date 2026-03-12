"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { getToken } from "../signin/auth";

// ── Types ──────────────────────────────────────────────────────────────────

export interface NoteFolder {
  id: number;
  name: string;
  parent_folder: number | null;
  created_at: string;
}

export interface NoteItem {
  id: number;
  title: string;
  folder_id: number | null;
  updated_at: string;
}

interface NotesContextValue {
  folders: NoteFolder[];
  notes: NoteItem[];
  selectedNoteId: number | null;
  selectNote: (id: number | null) => void;
  refreshKey: number;
  refresh: () => void;
  isLoading: boolean;
}

// ── Context ────────────────────────────────────────────────────────────────

const NotesContext = createContext<NotesContextValue>({
  folders: [],
  notes: [],
  selectedNoteId: null,
  selectNote: () => {},
  refreshKey: 0,
  refresh: () => {},
  isLoading: false,
});

// ── Provider ───────────────────────────────────────────────────────────────

export function NotesProvider({ children }: { children: ReactNode }) {
  const [folders, setFolders] = useState<NoteFolder[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [selectedNoteId, setSelectedNoteId] = useState<number | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const pathname = usePathname();
  const isNotesRoute = pathname?.startsWith("/content/notes");

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };
      const [fRes, nRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/note-folder`, { headers }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/note`, { headers }),
      ]);
      if (fRes.ok) setFolders(await fRes.json());
      if (nRes.ok) setNotes(await nRes.json());
    } catch (err) {
      console.error("NotesContext: fetch error", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Only fetch when on the notes route
  useEffect(() => {
    if (isNotesRoute) fetchData();
  }, [isNotesRoute, fetchData, refreshKey]);

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <NotesContext.Provider
      value={{ folders, notes, selectedNoteId, selectNote: setSelectedNoteId, refreshKey, refresh, isLoading }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export const useNotesContext = () => useContext(NotesContext);