"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./style.module.css";

// ── Types ──────────────────────────────────────────────────────────────────

type BlockType = "paragraph" | "h1" | "h2" | "h3";

interface NoteBlock {
  id: string;
  type: BlockType;
  content: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function generateId() {
  return Math.random().toString(36).slice(2, 10);
}

const BLOCK_LABELS: Record<BlockType, string> = {
  h1: "Título 1",
  h2: "Título 2",
  h3: "Título 3",
  paragraph: "Parágrafo",
};

const BLOCK_PLACEHOLDERS: Record<BlockType, string> = {
  h1: "Título principal",
  h2: "Subtítulo",
  h3: "Título menor",
  paragraph: "Escreva algo ou pressione '/' para comandos…",
};

// ── Block component ────────────────────────────────────────────────────────

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
  block,
  isFocused,
  showTypeMenu,
  onFocus,
  onBlur,
  onTypeMenuToggle,
  onTypeMenuClose,
  onChangeType,
  onContentChange,
  onEnter,
  onBackspaceEmpty,
  textareaRef,
}: BlockEditorProps) {
  const localRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const el = localRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [block.content]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onEnter();
    }
    if (e.key === "Backspace" && block.content === "") {
      e.preventDefault();
      onBackspaceEmpty();
    }
  }

  const blockTypeClass =
    block.type === "h1"
      ? styles.blockH1
      : block.type === "h2"
      ? styles.blockH2
      : block.type === "h3"
      ? styles.blockH3
      : styles.blockParagraph;

  return (
    <div className={`${styles.blockRow} ${isFocused ? styles.blockRowFocused : ""}`}>
      {/* Left: type badge */}
      <div className={styles.blockLeft}>
        <button
          className={`${styles.typeBadge} ${showTypeMenu ? styles.typeBadgeActive : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onTypeMenuToggle();
          }}
          tabIndex={-1}
          title="Tipo do bloco"
        >
          {block.type === "paragraph" ? "¶" : block.type.toUpperCase()}
        </button>

        {/* Type selector dropdown */}
        {showTypeMenu && (
          <div className={styles.typeMenu}>
            {(["h1", "h2", "h3", "paragraph"] as BlockType[]).map((t) => (
              <button
                key={t}
                className={`${styles.typeMenuItem} ${block.type === t ? styles.typeMenuItemActive : ""}`}
                onClick={() => {
                  onChangeType(t);
                  onTypeMenuClose();
                }}
              >
                <span className={styles.typeMenuIcon}>
                  {t === "paragraph" ? "¶" : t.toUpperCase()}
                </span>
                <span>{BLOCK_LABELS[t]}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: editable content */}
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
        onKeyDown={handleKeyDown}
        spellCheck={false}
      />
    </div>
  );
}

// ── Main notes page ────────────────────────────────────────────────────────

export default function NotesPage() {
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState<NoteBlock[]>([
    { id: generateId(), type: "paragraph", content: "" },
  ]);
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [typeMenuOpenId, setTypeMenuOpenId] = useState<string | null>(null);

  const textareaRefs = useRef<Map<string, HTMLTextAreaElement>>(new Map());
  const titleRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize title
  useEffect(() => {
    const el = titleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [title]);

  // Focus a block by id (next tick)
  const focusBlock = useCallback((id: string) => {
    setTimeout(() => {
      const el = textareaRefs.current.get(id);
      if (el) {
        el.focus();
        const len = el.value.length;
        el.setSelectionRange(len, len);
      }
    }, 0);
  }, []);

  function changeBlockContent(id: string, content: string) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content } : b))
    );
  }

  function changeBlockType(id: string, type: BlockType) {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, type } : b))
    );
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
      if (prev.length <= 1) return prev; // always keep at least one block
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const next = prev.filter((b) => b.id !== id);
      // Focus the block before
      const targetId = next[Math.max(0, idx - 1)].id;
      focusBlock(targetId);
      return next;
    });
  }

  // Close type menu when clicking outside
  useEffect(() => {
    function handleClick() {
      setTypeMenuOpenId(null);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const wordCount = [title, ...blocks.map((b) => b.content)]
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className={styles.page}>
      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.toolbarDate}>{today}</span>
        </div>
        <div className={styles.toolbarRight}>
          <span className={styles.wordCount}>{wordCount} {wordCount === 1 ? "palavra" : "palavras"}</span>
          <button className={styles.saveBtn} title="Salvar (em breve)">
            <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24"
              fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/>
              <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7"/>
              <path d="M7 3v4a1 1 0 0 0 1 1h7"/>
            </svg>
            Salvar
          </button>
        </div>
      </div>

      {/* ── Editor ── */}
      <div className={styles.editor}>
        {/* Title */}
        <div className={styles.titleWrapper}>
          <textarea
            ref={titleRef}
            className={styles.titleInput}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título sem título"
            rows={1}
            spellCheck={false}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                focusBlock(blocks[0].id);
              }
            }}
          />
          <div className={styles.titleDivider} />
        </div>

        {/* Blocks */}
        <div className={styles.blocksContainer}>
          {blocks.map((block) => (
            <BlockEditor
              key={block.id}
              block={block}
              isFocused={focusedBlockId === block.id}
              showTypeMenu={typeMenuOpenId === block.id}
              onFocus={() => setFocusedBlockId(block.id)}
              onBlur={() => setFocusedBlockId(null)}
              onTypeMenuToggle={() =>
                setTypeMenuOpenId((prev) => (prev === block.id ? null : block.id))
              }
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

          {/* Add block button */}
          <button
            className={styles.addBlockBtn}
            onClick={() => addBlockAfter(blocks[blocks.length - 1].id)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
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