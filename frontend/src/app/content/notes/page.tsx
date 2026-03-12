"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./style.module.css";
import { useNotesContext } from "../NotesContext";
import { getToken } from "../../signin/auth";

// ── Types ──────────────────────────────────────────────────────────────────

type BlockType = "paragraph" | "h1" | "h2" | "h3";
type SaveStatus = "idle" | "unsaved" | "saving" | "saved" | "error";

interface NoteBlock {
  id: string;
  type: BlockType;
  content: string;
}

interface NoteDetail {
  id: number;
  title: string;
  content: string | null;
  folder_id: number | null;
  created_at: string;
  updated_at: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

function parseBlocks(content: string | null | undefined): NoteBlock[] {
  if (!content) return [{ id: generateId(), type: "paragraph", content: "" }];
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return [{ id: generateId(), type: "paragraph", content: String(content) }];
}

const BLOCK_PLACEHOLDERS: Record<BlockType, string> = {
  h1: "Título principal",
  h2: "Subtítulo",
  h3: "Título menor",
  paragraph: "Escreva algo ou pressione Enter para novo bloco…",
};

const BLOCK_LABELS: Record<BlockType, string> = {
  h1: "Título 1",
  h2: "Título 2",
  h3: "Título 3",
  paragraph: "Parágrafo",
};

// ── BlockEditor ────────────────────────────────────────────────────────────

interface BlockEditorProps {
  block: NoteBlock;
  isFocused: boolean;
  showTypeMenu: boolean;
  onFocus: () => void;
  onBlur: () => void;
  onTypeMenuToggle: () => void;
  onTypeMenuClose: () => void;
  onChangeType: (type: BlockType) => void;
  onContentChange: (content: string) => void;
  onEnter: () => void;
  onBackspaceEmpty: () => void;
  textareaRef: (el: HTMLTextAreaElement | null) => void;
}

function BlockEditor({
  block, isFocused, showTypeMenu,
  onFocus, onBlur, onTypeMenuToggle, onTypeMenuClose,
  onChangeType, onContentChange, onEnter, onBackspaceEmpty,
  textareaRef,
}: BlockEditorProps) {
  const localRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = localRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [block.content]);

  const blockTypeClass =
    block.type === "h1" ? styles.blockH1
    : block.type === "h2" ? styles.blockH2
    : block.type === "h3" ? styles.blockH3
    : styles.blockParagraph;

  return (
    <div className={`${styles.blockRow} ${isFocused ? styles.blockRowFocused : ""}`}>
      <div className={styles.blockLeft}>
        <button
          className={`${styles.typeBadge} ${showTypeMenu ? styles.typeBadgeActive : ""}`}
          onClick={(e) => { e.stopPropagation(); onTypeMenuToggle(); }}
          tabIndex={-1}
        >
          {block.type === "paragraph" ? "¶" : block.type.toUpperCase()}
        </button>
        {showTypeMenu && (
          <div className={styles.typeMenu}>
            {(["h1", "h2", "h3", "paragraph"] as BlockType[]).map((t) => (
              <button
                key={t}
                className={`${styles.typeMenuItem} ${block.type === t ? styles.typeMenuItemActive : ""}`}
                onClick={() => { onChangeType(t); onTypeMenuClose(); }}
              >
                <span className={styles.typeMenuIcon}>{t === "paragraph" ? "¶" : t.toUpperCase()}</span>
                <span>{BLOCK_LABELS[t]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <textarea
        ref={(el) => {
          (localRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = el;
          textareaRef(el);
        }}
        className={`${styles.blockTextarea} ${blockTypeClass}`}
        value={block.content}
        placeholder={isFocused ? BLOCK_PLACEHOLDERS[block.type] : ""}
        rows={1}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={(e) => onContentChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onEnter(); }
          if (e.key === "Backspace" && block.content === "") { e.preventDefault(); onBackspaceEmpty(); }
        }}
        spellCheck={false}
      />
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function NotesPage() {
  const { selectedNoteId, refresh } = useNotesContext();

  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<NoteBlock[]>([{ id: generateId(), type: "paragraph", content: "" }]);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [typeMenuOpenId, setTypeMenuOpenId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isLoadingNote, setIsLoadingNote] = useState(false);

  const titleValRef = useRef(title);
  const blocksValRef = useRef(blocks);
  const selectedNoteIdRef = useRef(selectedNoteId);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const textareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());
  const titleInputRef = useRef<HTMLTextAreaElement>(null);
  const isFirstLoadRef = useRef(true);
  const prevSelectedNoteId = useRef<number | null>(null);

  useEffect(() => { titleValRef.current = title; }, [title]);
  useEffect(() => { blocksValRef.current = blocks; }, [blocks]);
  useEffect(() => { selectedNoteIdRef.current = selectedNoteId; }, [selectedNoteId]);

  // Auto-resize title
  useEffect(() => {
    const el = titleInputRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [title]);

  // ── Save ───────────────────────────────────────────────────────────────

  const saveNote = useCallback(async (id?: number) => {
    const noteId = id ?? selectedNoteIdRef.current;
    if (!noteId) return;
    setSaveStatus("saving");
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/note/${noteId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title: titleValRef.current || "Sem título",
          content: JSON.stringify(blocksValRef.current),
        }),
      });
      if (res.ok) {
        setSaveStatus("saved");
        refresh();
        setTimeout(() => setSaveStatus((s) => s === "saved" ? "idle" : s), 2000);
      } else {
        setSaveStatus("error");
      }
    } catch {
      setSaveStatus("error");
    }
  }, [refresh]);

  // Debounced auto-save on content changes
  useEffect(() => {
    if (!selectedNoteId) return;
    if (isFirstLoadRef.current) { isFirstLoadRef.current = false; return; }
    setSaveStatus("unsaved");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => saveNote(), 1500);
    return () => { if (saveTimerRef.current) clearTimeout(saveTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, blocks]);

  // ── Load note when selectedNoteId changes ──────────────────────────────

  useEffect(() => {
    if (selectedNoteId === prevSelectedNoteId.current) return;

    // Save previous note first
    if (prevSelectedNoteId.current && saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
      saveNote(prevSelectedNoteId.current);
    }

    prevSelectedNoteId.current = selectedNoteId;

    if (!selectedNoteId) {
      setTitle("");
      setBlocks([{ id: generateId(), type: "paragraph", content: "" }]);
      setSaveStatus("idle");
      return;
    }

    setIsLoadingNote(true);
    isFirstLoadRef.current = true;
    setSaveStatus("idle");

    const token = getToken();
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/note/${selectedNoteId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((note: NoteDetail) => {
        setTitle(note.title || "");
        setBlocks(parseBlocks(note.content));
      })
      .catch(console.error)
      .finally(() => setIsLoadingNote(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNoteId]);

  // Close type menus on outside click
  useEffect(() => {
    function handle() { setTypeMenuOpenId(null); }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // ── Block helpers ──────────────────────────────────────────────────────

  const focusBlock = useCallback((id: string) => {
    setTimeout(() => {
      const el = textareaRefs.current.get(id);
      if (el) { el.focus(); const len = el.value.length; el.setSelectionRange(len, len); }
    }, 0);
  }, []);

  function changeBlockContent(id: string, content: string) {
    setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, content } : b));
  }

  function changeBlockType(id: string, type: BlockType) {
    setBlocks((prev) => prev.map((b) => b.id === id ? { ...b, type } : b));
  }

  function addBlockAfter(id: string) {
    const newBlock: NoteBlock = { id: generateId(), type: "paragraph", content: "" };
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
    focusBlock(newBlock.id);
  }

  function removeBlockIfEmpty(id: string) {
    setBlocks((prev) => {
      if (prev.length <= 1) return prev;
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const next = prev.filter((b) => b.id !== id);
      focusBlock(next[Math.max(0, idx - 1)].id);
      return next;
    });
  }

  // ── Save status ────────────────────────────────────────────────────────

  const statusMap: Record<SaveStatus, { label: string; color: string }> = {
    idle:    { label: "",               color: "transparent" },
    unsaved: { label: "Não salvo",      color: "rgba(255,200,80,0.75)" },
    saving:  { label: "Salvando…",      color: "rgba(135,116,225,0.75)" },
    saved:   { label: "Salvo",          color: "rgba(74,222,128,0.75)" },
    error:   { label: "Erro ao salvar", color: "rgba(248,113,113,0.75)" },
  };

  const wordCount = selectedNoteId
    ? [title, ...blocks.map((b) => b.content)].join(" ").trim().split(/\s+/).filter(Boolean).length
    : 0;

  // ── Render ─────────────────────────────────────────────────────────────

  if (!selectedNoteId) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <p className={styles.emptyTitle}>Nenhuma nota selecionada</p>
          <p className={styles.emptySub}>Selecione ou crie uma nota na barra lateral.</p>
        </div>
      </div>
    );
  }

  if (isLoadingNote) {
    return (
      <div className={styles.page}>
        <div className={styles.emptyState}>
          <div className={styles.spinner} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft} />
        <div className={styles.toolbarRight}>
          {saveStatus !== "idle" && (
            <span className={styles.saveStatus} style={{ color: statusMap[saveStatus].color }}>
              {saveStatus === "saving" && <span className={styles.spinnerDot} />}
              {statusMap[saveStatus].label}
            </span>
          )}
          <span className={styles.wordCount}>{wordCount} {wordCount === 1 ? "palavra" : "palavras"}</span>
          <button className={styles.saveBtn} onClick={() => saveNote()} disabled={saveStatus === "saving"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.2 3a2 2 0 011.4.6l3.8 3.8a2 2 0 01.6 1.4V19a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/>
              <path d="M17 21v-7a1 1 0 00-1-1H8a1 1 0 00-1 1v7"/>
              <path d="M7 3v4a1 1 0 001 1h7"/>
            </svg>
            Salvar
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className={styles.editor}>
        <div className={styles.titleWrapper}>
          <textarea
            ref={titleInputRef}
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título sem título"
            rows={1}
            spellCheck={false}
            onKeyDown={(e) => {
              if (e.key === "Enter") { e.preventDefault(); focusBlock(blocks[0].id); }
            }}
          />
          <div className={styles.titleDivider} />
        </div>

        <div className={styles.blocksContainer}>
          {blocks.map((block) => (
            <BlockEditor
              key={block.id}
              block={block}
              isFocused={focusedBlockId === block.id}
              showTypeMenu={typeMenuOpenId === block.id}
              onFocus={() => setFocusedBlockId(block.id)}
              onBlur={() => setFocusedBlockId(null)}
              onTypeMenuToggle={() => setTypeMenuOpenId((prev) => (prev === block.id ? null : block.id))}
              onTypeMenuClose={() => setTypeMenuOpenId(null)}
              onChangeType={(type) => changeBlockType(block.id, type)}
              onContentChange={(content) => changeBlockContent(block.id, content)}
              onEnter={() => addBlockAfter(block.id)}
              onBackspaceEmpty={() => removeBlockIfEmpty(block.id)}
              textareaRef={(el) => {
                if (el) textareaRefs.current.set(block.id, el);
                else textareaRefs.current.delete(block.id);
              }}
            />
          ))}
          <button className={styles.addBlockBtn} onClick={() => addBlockAfter(blocks[blocks.length - 1].id)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"/><path d="M12 5v14"/>
            </svg>
            Novo bloco
          </button>
        </div>
      </div>
    </div>
  );
}