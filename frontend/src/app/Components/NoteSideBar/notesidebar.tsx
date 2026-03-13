"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import styles from "./style.module.css";
import { getToken } from "../../signin/auth";

// ── Types ──────────────────────────────────────────────────────────────────

interface Folder {
  id: number;
  name: string;
  parent_folder: number | null;
  created_at: string;
}

interface NoteItem {
  id: number;
  title: string;
  folder_id: number | null;
  updated_at: string;
}

interface NoteSidebarProps {
  selectedNoteId: number | null;
  onSelectNote: (note: NoteItem) => void;
  onNoteDeleted: (id: number) => void;
  refreshKey: number;
  onRefreshRequest: () => void;
}

// ── Icons ──────────────────────────────────────────────────────────────────

const FolderIcon = ({ open }: { open: boolean }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" opacity={open ? 1 : 0.75}>
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 2h9a2 2 0 012 2z" />
  </svg>
);

const NoteIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10,9 9,9 8,9" />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.18s cubic-bezier(.4,0,.2,1)" }}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const NewFolderIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 2h9a2 2 0 012 2z" />
    <line x1="12" y1="11" x2="12" y2="17" />
    <line x1="9" y1="14" x2="15" y2="14" />
  </svg>
);

const NewNoteIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// ── Main Component ─────────────────────────────────────────────────────────

export default function NoteSidebar({
  selectedNoteId,
  onSelectNote,
  onNoteDeleted,
  refreshKey,
  onRefreshRequest,
}: NoteSidebarProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [actionMenu, setActionMenu] = useState<{ type: "folder" | "note"; id: number } | null>(null);
  const [renaming, setRenaming] = useState<{ type: "folder" | "note"; id: number; value: string } | null>(null);
  const [creating, setCreating] = useState<{ type: "folder" | "note"; parentFolderId: number | null; value: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const renameInputRef = useRef<HTMLInputElement>(null);
  const createInputRef = useRef<HTMLInputElement>(null);

  // ── Data fetching ──────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
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
      console.error("Error fetching sidebar data:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  // Focus inputs when they appear
  useEffect(() => {
    if (renaming) setTimeout(() => renameInputRef.current?.focus(), 30);
  }, [renaming]);
  useEffect(() => {
    if (creating) setTimeout(() => createInputRef.current?.focus(), 30);
  }, [creating]);

  // Close action menu on outside click
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!(e.target as Element).closest(`.${styles.dotsBtn}`) &&
          !(e.target as Element).closest(`.${styles.actionMenu}`)) {
        setActionMenu(null);
      }
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // ── CRUD operations ────────────────────────────────────────────────────

  async function createFolder(name: string, parentFolderId: number | null) {
    const token = getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/note-folder`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name, parentFolder: parentFolderId }),
    });
    if (res.ok) {
      await fetchData();
      if (parentFolderId) setExpanded((p) => new Set([...p, parentFolderId]));
    }
  }

  async function createNote(title: string, folderId: number | null) {
    const token = getToken();
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/note`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title, folderId }),
    });
    if (res.ok) {
      const note = await res.json();
      await fetchData();
      if (folderId) setExpanded((p) => new Set([...p, folderId]));
      onSelectNote(note);
    }
  }

  async function renameFolder(id: number, name: string) {
    const token = getToken();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/note-folder/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name }),
    });
    await fetchData();
  }

  async function renameNote(id: number, title: string) {
    const token = getToken();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/note/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ title }),
    });
    await fetchData();
    onRefreshRequest();
  }

  async function deleteFolder(id: number) {
    const token = getToken();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/note-folder/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchData();
  }

  async function deleteNote(id: number) {
    const token = getToken();
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/note/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await fetchData();
    onNoteDeleted(id);
  }

  // ── Submit handlers ────────────────────────────────────────────────────

  function submitRename() {
    if (!renaming) return;
    const val = renaming.value.trim();
    if (val) {
      if (renaming.type === "folder") renameFolder(renaming.id, val);
      else renameNote(renaming.id, val);
    }
    setRenaming(null);
  }

  function submitCreate() {
    if (!creating) return;
    const val = creating.value.trim();
    if (val) {
      if (creating.type === "folder") createFolder(val, creating.parentFolderId);
      else createNote(val, creating.parentFolderId);
    }
    setCreating(null);
  }

  // ── Render helpers ─────────────────────────────────────────────────────

  function renderCreateInput(parentFolderId: number | null, depth = 0) {
    if (!creating || creating.parentFolderId !== parentFolderId) return null;
    return (
      <div className={styles.createRow} style={{ paddingLeft: `${16 + depth * 16}px` }}>
        <span className={styles.createIcon}>
          {creating.type === "note" ? <NoteIcon /> : <FolderIcon open={false} />}
        </span>
        <input
          ref={createInputRef}
          className={styles.inlineInput}
          placeholder={creating.type === "note" ? "Nome da nota…" : "Nome da pasta…"}
          value={creating.value}
          onChange={(e) => setCreating((p) => p ? { ...p, value: e.target.value } : null)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitCreate();
            if (e.key === "Escape") setCreating(null);
          }}
          onBlur={() => { if (!creating.value.trim()) setCreating(null); else submitCreate(); }}
        />
      </div>
    );
  }

  function renderNoteRow(note: NoteItem, depth = 0) {
    const isSelected = selectedNoteId === note.id;
    const isRenaming = renaming?.type === "note" && renaming.id === note.id;
    const isMenuOpen = actionMenu?.type === "note" && actionMenu.id === note.id;

    return (
      <div
        key={note.id}
        className={`${styles.itemRow} ${isSelected ? styles.itemSelected : ""}`}
        style={{ paddingLeft: `${16 + depth * 16}px` }}
      >
        {isRenaming ? (
          <div className={styles.renameRow}>
            <span className={styles.rowIcon} style={{ color: "rgba(135,116,225,0.7)" }}><NoteIcon /></span>
            <input
              ref={renameInputRef}
              className={styles.inlineInput}
              value={renaming.value}
              onChange={(e) => setRenaming((p) => p ? { ...p, value: e.target.value } : null)}
              onKeyDown={(e) => { if (e.key === "Enter") submitRename(); if (e.key === "Escape") setRenaming(null); }}
              onBlur={submitRename}
            />
          </div>
        ) : (
          <>
            <button className={styles.itemBtn} onClick={() => onSelectNote(note)}>
              <span className={styles.rowIcon} style={{ color: isSelected ? "#8774E1" : "rgba(255,255,255,0.35)" }}>
                <NoteIcon />
              </span>
              <span className={styles.itemLabel}>{note.title || "Sem título"}</span>
            </button>
            <div className={styles.rowActions}>
              <button
                className={styles.dotsBtn}
                onClick={(e) => { e.stopPropagation(); setActionMenu(isMenuOpen ? null : { type: "note", id: note.id }); }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
                </svg>
              </button>
              {isMenuOpen && (
                <div className={styles.actionMenu}>
                  <button className={styles.menuItem} onClick={() => { setRenaming({ type: "note", id: note.id, value: note.title }); setActionMenu(null); }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Renomear
                  </button>
                  <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={() => { deleteNote(note.id); setActionMenu(null); }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                    Excluir
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  function renderFolderRow(folder: Folder, depth = 0) {
    const isOpen = expanded.has(folder.id);
    const childFolders = folders.filter((f) => f.parent_folder === folder.id);
    const childNotes = notes.filter((n) => n.folder_id === folder.id);
    const isRenaming = renaming?.type === "folder" && renaming.id === folder.id;
    const isMenuOpen = actionMenu?.type === "folder" && actionMenu.id === folder.id;

    return (
      <div key={folder.id}>
        <div
          className={styles.folderRow}
          style={{ paddingLeft: `${8 + depth * 16}px` }}
        >
          {isRenaming ? (
            <div className={styles.renameRow}>
              <span className={styles.chevronWrap}><ChevronIcon open={isOpen} /></span>
              <span className={styles.rowIcon} style={{ color: "#8774E1" }}><FolderIcon open={isOpen} /></span>
              <input
                ref={renameInputRef}
                className={styles.inlineInput}
                value={renaming.value}
                onChange={(e) => setRenaming((p) => p ? { ...p, value: e.target.value } : null)}
                onKeyDown={(e) => { if (e.key === "Enter") submitRename(); if (e.key === "Escape") setRenaming(null); }}
                onBlur={submitRename}
              />
            </div>
          ) : (
            <>
              <button className={styles.folderBtn} onClick={() => setExpanded((p) => { const n = new Set(p); n.has(folder.id) ? n.delete(folder.id) : n.add(folder.id); return n; })}>
                <span className={styles.chevronWrap}><ChevronIcon open={isOpen} /></span>
                <span className={styles.rowIcon} style={{ color: "#8774E1" }}><FolderIcon open={isOpen} /></span>
                <span className={styles.itemLabel}>{folder.name}</span>
              </button>
              <div className={styles.rowActions}>
                <button
                  className={styles.addInFolderBtn}
                  title="Nova nota nesta pasta"
                  onClick={() => { setCreating({ type: "note", parentFolderId: folder.id, value: "" }); setExpanded((p) => new Set([...p, folder.id])); }}
                >
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <button
                  className={styles.dotsBtn}
                  onClick={(e) => { e.stopPropagation(); setActionMenu(isMenuOpen ? null : { type: "folder", id: folder.id }); }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
                  </svg>
                </button>
                {isMenuOpen && (
                  <div className={styles.actionMenu}>
                    <button className={styles.menuItem} onClick={() => { setCreating({ type: "folder", parentFolderId: folder.id, value: "" }); setExpanded((p) => new Set([...p, folder.id])); setActionMenu(null); }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 2h9a2 2 0 012 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>
                      Nova subpasta
                    </button>
                    <button className={styles.menuItem} onClick={() => { setRenaming({ type: "folder", id: folder.id, value: folder.name }); setActionMenu(null); }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      Renomear
                    </button>
                    <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={() => { deleteFolder(folder.id); setActionMenu(null); }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
                      Excluir pasta
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {isOpen && (
          <div>
            {childFolders.map((f) => renderFolderRow(f, depth + 1))}
            {childNotes.map((n) => renderNoteRow(n, depth + 1))}
            {renderCreateInput(folder.id, depth + 1)}
          </div>
        )}
      </div>
    );
  }

  // ── Build tree ─────────────────────────────────────────────────────────

  const rootFolders = folders.filter((f) => f.parent_folder === null);
  const rootNotes = notes.filter((n) => n.folder_id === null);
  const isEmpty = folders.length === 0 && notes.length === 0 && !creating;

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.headerTitle}>Notas</span>
        <div className={styles.headerActions}>
          <button
            className={styles.headerBtn}
            title="Nova pasta"
            onClick={() => setCreating({ type: "folder", parentFolderId: null, value: "" })}
          >
            <NewFolderIcon />
          </button>
          <button
            className={styles.headerBtn}
            title="Nova nota"
            onClick={() => setCreating({ type: "note", parentFolderId: null, value: "" })}
          >
            <NewNoteIcon />
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className={styles.divider} />

      {/* Tree */}
      <div className={styles.tree}>
        {isLoading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.loadingDots}>
              <span /><span /><span />
            </div>
          </div>
        ) : (
          <>
            {rootFolders.map((f) => renderFolderRow(f, 0))}
            {rootNotes.map((n) => renderNoteRow(n, 0))}
            {renderCreateInput(null, 0)}
            {isEmpty && (
              <div className={styles.emptyState}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                <p>Nenhuma nota ainda</p>
                <span>Use os botões acima para criar</span>
              </div>
            )}
          </>
        )}
      </div>
    </aside>
  );
}