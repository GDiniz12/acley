"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "./NotesSidebar.module.css";
import { useNotesContext, type NoteFolder, type NoteItem } from "../../content/NotesContext";
import { getToken } from "../../signin/auth";

// ── Icons ──────────────────────────────────────────────────────────────────

const FolderIcon = ({ open }: { open: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" opacity={open ? 1 : 0.7}>
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 2h9a2 2 0 012 2z" />
  </svg>
);

const NoteIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <polyline points="14,2 14,8 20,8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const ChevronIcon = ({ open }: { open: boolean }) => (
  <svg
    width="9" height="9" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.16s ease" }}
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const PlusIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const DotsIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
  </svg>
);

const NewFolderIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 2h9a2 2 0 012 2z"/>
    <line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>
  </svg>
);

const NewNoteIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// ── Types ──────────────────────────────────────────────────────────────────

type CreatingState = { type: "folder" | "note"; parentFolderId: number | null; value: string } | null;
type RenamingState = { type: "folder" | "note"; id: number; value: string } | null;
type ActionMenu   = { type: "folder" | "note"; id: number } | null;

interface Props {
  searchQuery?: string;
}

// ── Highlight helper ───────────────────────────────────────────────────────

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <span className={styles.highlight}>{text.slice(idx, idx + query.length)}</span>
      {text.slice(idx + query.length)}
    </>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function NotesSidebarSection({ searchQuery = "" }: Props) {
  const { folders, notes, selectedNoteId, selectNote, refresh } = useNotesContext();
  const router = useRouter();

  const [expanded, setExpanded]                 = useState<Set<number>>(new Set());
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);
  const [creating, setCreating]                 = useState<CreatingState>(null);
  const [renaming, setRenaming]                 = useState<RenamingState>(null);
  const [actionMenu, setActionMenu]             = useState<ActionMenu>(null);

  const renameRef = useRef<HTMLInputElement>(null);
  const createRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (renaming) setTimeout(() => renameRef.current?.focus(), 20); }, [renaming]);
  useEffect(() => { if (creating) setTimeout(() => createRef.current?.focus(), 20); }, [creating]);

  // Clear folder selection when searching
  useEffect(() => {
    if (searchQuery) setSelectedFolderId(null);
  }, [searchQuery]);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (
        !(e.target as Element).closest(`.${styles.dotsBtn}`) &&
        !(e.target as Element).closest(`.${styles.actionMenu}`)
      ) setActionMenu(null);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // ── API helpers ────────────────────────────────────────────────────────

  function authHeaders() {
    return { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` };
  }

  async function apiCreateFolder(name: string, parentFolderId: number | null) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/note-folder`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ name, parentFolder: parentFolderId }),
    });
    refresh();
    if (parentFolderId) setExpanded((p) => new Set([...p, parentFolderId]));
  }

  async function apiCreateNote(title: string, folderId: number | null) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/note`, {
      method: "POST", headers: authHeaders(),
      body: JSON.stringify({ title, folderId }),
    });
    if (res.ok) {
      const note = await res.json();
      refresh();
      if (folderId) setExpanded((p) => new Set([...p, folderId]));
      selectNote(note.id);
      router.push("/content/notes");
    }
  }

  async function apiRenameFolder(id: number, name: string) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/note-folder/${id}`, {
      method: "PUT", headers: authHeaders(), body: JSON.stringify({ name }),
    });
    refresh();
  }

  async function apiRenameNote(id: number, title: string) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/note/${id}`, {
      method: "PUT", headers: authHeaders(), body: JSON.stringify({ title }),
    });
    refresh();
  }

  async function apiDeleteFolder(id: number) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/note-folder/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (selectedFolderId === id) setSelectedFolderId(null);
    refresh();
  }

  async function apiDeleteNote(id: number) {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/note/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (id === selectedNoteId) selectNote(null);
    refresh();
  }

  // ── Submit helpers ─────────────────────────────────────────────────────

  function submitCreate() {
    if (!creating) return;
    const val = creating.value.trim();
    if (val) {
      if (creating.type === "folder") apiCreateFolder(val, creating.parentFolderId);
      else apiCreateNote(val, creating.parentFolderId);
    }
    setCreating(null);
  }

  function submitRename() {
    if (!renaming) return;
    const val = renaming.value.trim();
    if (val) {
      if (renaming.type === "folder") apiRenameFolder(renaming.id, val);
      else apiRenameNote(renaming.id, val);
    }
    setRenaming(null);
  }

  // ── Folder path helper ─────────────────────────────────────────────────

  function getFolderPath(folderId: number | null): string {
    if (!folderId) return "Raiz";
    const parts: string[] = [];
    let current: number | null = folderId;
    while (current !== null) {
      const folder = folders.find((f) => f.id === current);
      if (!folder) break;
      parts.unshift(folder.name);
      current = folder.parent_folder;
    }
    return parts.join(" / ") || "Raiz";
  }

  // ── Search results ─────────────────────────────────────────────────────

  function renderSearchResults() {
    const q = searchQuery.toLowerCase();
    const matchedFolders = folders.filter((f) => f.name.toLowerCase().includes(q));
    const matchedNotes   = notes.filter((n) => (n.title || "Sem título").toLowerCase().includes(q));

    if (matchedFolders.length === 0 && matchedNotes.length === 0) {
      return <div className={styles.empty}>Nenhum resultado.</div>;
    }

    return (
      <div className={styles.searchResults}>
        {matchedFolders.map((folder) => (
          <div
            key={`f-${folder.id}`}
            className={styles.searchResultRow}
            onClick={() => {
              setSelectedFolderId(folder.id);
              setExpanded((p) => new Set([...p, folder.id]));
            }}
          >
            <span className={styles.searchResultIcon} style={{ color: "var(--accent)" }}>
              <FolderIcon open={false} />
            </span>
            <div className={styles.searchResultText}>
              <span className={styles.searchResultTitle}>
                <HighlightedText text={folder.name} query={searchQuery} />
              </span>
              <span className={styles.searchResultMeta}>
                {getFolderPath(folder.parent_folder)}
              </span>
            </div>
          </div>
        ))}

        {matchedNotes.map((note) => {
          const isActive = selectedNoteId === note.id;
          return (
            <div
              key={`n-${note.id}`}
              className={`${styles.searchResultRow} ${isActive ? styles.searchResultActive : ""}`}
              onClick={() => { selectNote(note.id); router.push("/content/notes"); }}
            >
              <span className={styles.searchResultIcon} style={{ color: isActive ? "var(--accent)" : "var(--text-faint)" }}>
                <NoteIcon />
              </span>
              <div className={styles.searchResultText}>
                <span className={styles.searchResultTitle}>
                  <HighlightedText text={note.title || "Sem título"} query={searchQuery} />
                </span>
                <span className={styles.searchResultMeta}>
                  {getFolderPath(note.folder_id)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Tree view ──────────────────────────────────────────────────────────

  function renderCreateInput(parentFolderId: number | null, depth: number) {
    if (!creating || creating.parentFolderId !== parentFolderId) return null;
    return (
      <div className={styles.createRow} style={{ paddingLeft: `${12 + depth * 14}px` }}>
        <span className={styles.rowIcon} style={{ color: "var(--text-tertiary)" }}>
          {creating.type === "note" ? <NoteIcon /> : <FolderIcon open={false} />}
        </span>
        <input
          ref={createRef}
          className={styles.inlineInput}
          placeholder={creating.type === "note" ? "Nome da nota…" : "Nome da pasta…"}
          value={creating.value}
          onChange={(e) => setCreating((p) => p ? { ...p, value: e.target.value } : null)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitCreate();
            if (e.key === "Escape") setCreating(null);
          }}
          onBlur={() => { if (!creating?.value.trim()) setCreating(null); else submitCreate(); }}
        />
      </div>
    );
  }

  function renderNoteRow(note: NoteItem, depth: number) {
    const isSelected = selectedNoteId === note.id;
    const isRenaming = renaming?.type === "note" && renaming.id === note.id;
    const isMenuOpen = actionMenu?.type === "note" && actionMenu.id === note.id;

    return (
      <div
        key={note.id}
        className={`${styles.row} ${isSelected ? styles.rowSelected : ""}`}
        style={{ paddingLeft: `${12 + depth * 14}px` }}
      >
        {isRenaming ? (
          <>
            <span className={styles.rowIcon} style={{ color: "var(--text-tertiary)" }}><NoteIcon /></span>
            <input
              ref={renameRef}
              className={styles.inlineInput}
              value={renaming.value}
              onChange={(e) => setRenaming((p) => p ? { ...p, value: e.target.value } : null)}
              onKeyDown={(e) => { if (e.key === "Enter") submitRename(); if (e.key === "Escape") setRenaming(null); }}
              onBlur={submitRename}
            />
          </>
        ) : (
          <>
            <button
              className={styles.itemBtn}
              onClick={() => { selectNote(note.id); router.push("/content/notes"); }}
            >
              <span className={styles.rowIcon} style={{ color: isSelected ? "var(--accent)" : "var(--text-faint)" }}>
                <NoteIcon />
              </span>
              <span className={styles.itemLabel}>{note.title || "Sem título"}</span>
            </button>
            <div className={styles.rowActions}>
              <button
                className={styles.dotsBtn}
                onClick={(e) => { e.stopPropagation(); setActionMenu(isMenuOpen ? null : { type: "note", id: note.id }); }}
              >
                <DotsIcon />
              </button>
              {isMenuOpen && (
                <div className={styles.actionMenu}>
                  <button className={styles.menuItem} onClick={() => { setRenaming({ type: "note", id: note.id, value: note.title }); setActionMenu(null); }}>
                    Renomear
                  </button>
                  <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={() => { apiDeleteNote(note.id); setActionMenu(null); }}>
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

  function renderFolderRow(folder: NoteFolder, depth: number) {
    const isOpen           = expanded.has(folder.id);
    const isFolderSelected = selectedFolderId === folder.id;
    const childFolders     = folders.filter((f) => f.parent_folder === folder.id);
    const childNotes       = notes.filter((n) => n.folder_id === folder.id);
    const isRenaming       = renaming?.type === "folder" && renaming.id === folder.id;
    const isMenuOpen       = actionMenu?.type === "folder" && actionMenu.id === folder.id;

    return (
      <div key={folder.id}>
        <div
          className={`${styles.row} ${isFolderSelected ? styles.folderSelected : ""}`}
          style={{ paddingLeft: `${4 + depth * 14}px` }}
        >
          {isRenaming ? (
            <>
              <button
                className={styles.chevronBtn}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setExpanded((p) => { const n = new Set(p); n.has(folder.id) ? n.delete(folder.id) : n.add(folder.id); return n; })}
              >
                <ChevronIcon open={isOpen} />
              </button>
              <span className={styles.rowIcon} style={{ color: "var(--accent)" }}><FolderIcon open={isOpen} /></span>
              <input
                ref={renameRef}
                className={styles.inlineInput}
                value={renaming.value}
                onChange={(e) => setRenaming((p) => p ? { ...p, value: e.target.value } : null)}
                onKeyDown={(e) => { if (e.key === "Enter") submitRename(); if (e.key === "Escape") setRenaming(null); }}
                onBlur={submitRename}
              />
            </>
          ) : (
            <>
              <button
                className={styles.chevronBtn}
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => {
                  e.stopPropagation();
                  setExpanded((p) => { const n = new Set(p); n.has(folder.id) ? n.delete(folder.id) : n.add(folder.id); return n; });
                }}
              >
                <ChevronIcon open={isOpen} />
              </button>

              <button
                className={styles.folderBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFolderId((prev) => prev === folder.id ? null : folder.id);
                  setExpanded((p) => new Set([...p, folder.id]));
                }}
              >
                <span className={styles.rowIcon} style={{ color: isFolderSelected ? "var(--accent)" : "var(--text-tertiary)" }}>
                  <FolderIcon open={isOpen} />
                </span>
                <span className={styles.itemLabel}>{folder.name}</span>
              </button>

              <div className={styles.rowActions}>
                <button
                  className={styles.addInFolderBtn}
                  title="Nova nota aqui"
                  onClick={() => {
                    setCreating({ type: "note", parentFolderId: folder.id, value: "" });
                    setExpanded((p) => new Set([...p, folder.id]));
                  }}
                >
                  <PlusIcon />
                </button>
                <button
                  className={styles.dotsBtn}
                  onClick={(e) => { e.stopPropagation(); setActionMenu(isMenuOpen ? null : { type: "folder", id: folder.id }); }}
                >
                  <DotsIcon />
                </button>
                {isMenuOpen && (
                  <div className={styles.actionMenu}>
                    <button className={styles.menuItem} onClick={() => { setCreating({ type: "folder", parentFolderId: folder.id, value: "" }); setExpanded((p) => new Set([...p, folder.id])); setActionMenu(null); }}>
                      Nova subpasta
                    </button>
                    <button className={styles.menuItem} onClick={() => { setRenaming({ type: "folder", id: folder.id, value: folder.name }); setActionMenu(null); }}>
                      Renomear
                    </button>
                    <button className={`${styles.menuItem} ${styles.menuItemDanger}`} onClick={() => { apiDeleteFolder(folder.id); setActionMenu(null); }}>
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

  const rootFolders        = folders.filter((f) => f.parent_folder === null);
  const rootNotes          = notes.filter((n) => n.folder_id === null);
  const selectedFolderName = selectedFolderId
    ? folders.find((f) => f.id === selectedFolderId)?.name
    : null;

  return (
    <div className={styles.section}>
      {!searchQuery && (
        <div className={styles.sectionHeader}>
          <span className={styles.sectionTitle}>
            {selectedFolderName ?? "NOTAS"}
          </span>
          <div className={styles.sectionHeaderActions}>
            <button
              className={styles.sectionAction}
              title={selectedFolderName ? `Nova pasta em "${selectedFolderName}"` : "Nova pasta"}
              onClick={() => {
                setCreating({ type: "folder", parentFolderId: selectedFolderId, value: "" });
                if (selectedFolderId) setExpanded((p) => new Set([...p, selectedFolderId]));
              }}
            >
              <NewFolderIcon />
            </button>
            <button
              className={styles.sectionAction}
              title={selectedFolderName ? `Nova nota em "${selectedFolderName}"` : "Nova nota"}
              onClick={() => {
                setCreating({ type: "note", parentFolderId: selectedFolderId, value: "" });
                if (selectedFolderId) setExpanded((p) => new Set([...p, selectedFolderId]));
              }}
            >
              <NewNoteIcon />
            </button>
          </div>
        </div>
      )}

      {searchQuery ? renderSearchResults() : (
        <div className={styles.tree}>
          {rootFolders.map((f) => renderFolderRow(f, 0))}
          {rootNotes.map((n) => renderNoteRow(n, 0))}
          {renderCreateInput(null, 0)}
          {folders.length === 0 && notes.length === 0 && !creating && (
            <div className={styles.empty}>Nenhuma nota ainda.</div>
          )}
        </div>
      )}
    </div>
  );
}