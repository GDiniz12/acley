"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./style.module.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { getToken } from "../../signin/auth";
import NotesSidebarSection from "./NotesSideBarSection";
import { useNotebookContext } from "../../content/NotebookContext";

// ── Icons ──────────────────────────────────────────────────────────────────

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
        fill="none" stroke="#c2bdbde6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 5h16"/><path d="M4 12h16"/><path d="M4 19h16"/>
    </svg>
);

const ChevronLeftIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6"/>
    </svg>
);

const ChevronRightIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6"/>
    </svg>
);

const ProfileIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
);

const NotesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 7v14"/>
        <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/>
    </svg>
);

const FlashcardsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="14" x="2" y="5" rx="2"/>
        <line x1="2" x2="22" y1="10" y2="10"/>
    </svg>
);

const AITutorIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/>
        <path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/>
    </svg>
);

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
);

const PlusIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14"/><path d="M12 5v14"/>
    </svg>
);

const NotebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/>
        <rect width="16" height="20" x="4" y="2" rx="2"/>
    </svg>
);

const DotsIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" />
    </svg>
);

const ClearIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
);

// ── Nav items ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
    { id: "profile",    label: "Perfil",       icon: <ProfileIcon />,    href: "/profile" },
    { id: "notes",      label: "Notas",         icon: <NotesIcon />,      href: "/content/notes" },
    { id: "flashcards", label: "Flashcards",    icon: <FlashcardsIcon />, href: "/content/cards" },
    { id: "ai-tutor",   label: "AI Tutor",      icon: <AITutorIcon />,    href: "/tutor" },
    { id: "settings",   label: "Configurações", icon: <SettingsIcon />,   href: "/settings" },
] as const;

// ── Types ──────────────────────────────────────────────────────────────────

interface Notebook {
    id: string;
    name: string;
}

interface SideBarGlassProps {
    isOpen?: boolean;
    onToggle?: () => void;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function isCardsRoute(pathname: string) {
    return pathname === "/content/cards";
}

function isNotesRoute(pathname: string) {
    return pathname.startsWith("/content/notes");
}

// ── Highlight helper ───────────────────────────────────────────────────────

function HighlightedText({ text, query }: { text: string; query: string }) {
    if (!query) return <>{text}</>;
    const idx = text.toLowerCase().indexOf(query.toLowerCase());
    if (idx === -1) return <>{text}</>;
    return (
        <>
            {text.slice(0, idx)}
            <mark style={{
                background: "rgba(10,10,11,0.1)",
                color: "var(--text-primary)",
                borderRadius: "3px",
                padding: "0 1px",
                fontWeight: 700,
            }}>
                {text.slice(idx, idx + query.length)}
            </mark>
            {text.slice(idx + query.length)}
        </>
    );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function SideBarGlass({ isOpen: isOpenProp, onToggle }: SideBarGlassProps) {
    const [internalOpen, setInternalOpen] = useState(true);
    const sidebarOpen = isOpenProp !== undefined ? isOpenProp : internalOpen;

    function handleToggle() {
        if (onToggle) onToggle();
        else setInternalOpen((prev) => !prev);
    }

    const [tooltipOpen, setTooltipOpen]   = useState(false);
    const [activeId, setActiveId]         = useState<string>("notes");
    const [searchQuery, setSearchQuery]   = useState("");
    const tooltipRef     = useRef<HTMLDivElement>(null);
    const menuWrapperRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [notebooks, setNotebooks]               = useState<Notebook[]>([]);
    const [notebooksLoading, setNotebooksLoading] = useState(false);
    const [creatingNotebook, setCreatingNotebook] = useState(false);

    const [notebookMenu, setNotebookMenu]         = useState<string | null>(null);
    const [renamingNotebook, setRenamingNotebook] = useState<{ id: string; value: string } | null>(null);
    const renameInputRef = useRef<HTMLInputElement>(null);

    const pathname = usePathname();
    const router   = useRouter();
    const showNotebooks = isCardsRoute(pathname);
    const showNotes     = isNotesRoute(pathname);

    const { selectedNotebookId, selectNotebook } = useNotebookContext();

    // Clear search when route changes
    useEffect(() => {
        setSearchQuery("");
    }, [pathname]);

    useEffect(() => {
        const match = NAV_ITEMS.find((item) => pathname.startsWith(item.href));
        if (match) setActiveId(match.id);
    }, [pathname]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                tooltipRef.current     && !tooltipRef.current.contains(e.target as Node) &&
                menuWrapperRef.current && !menuWrapperRef.current.contains(e.target as Node)
            ) setTooltipOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as Element;
            if (
                !target.closest(`.${styles.notebookDotsBtn}`) &&
                !target.closest(`.${styles.notebookActionMenu}`)
            ) setNotebookMenu(null);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (renamingNotebook) setTimeout(() => renameInputRef.current?.focus(), 20);
    }, [renamingNotebook]);

    const fetchNotebooks = useCallback(async () => {
        setNotebooksLoading(true);
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notebook/user/`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Erro ao carregar notebooks");
            const data: Notebook[] = await res.json();
            setNotebooks(data);
            if (data.length > 0 && !selectedNotebookId) {
                selectNotebook(data[0].id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setNotebooksLoading(false);
        }
    }, [selectedNotebookId, selectNotebook]);

    useEffect(() => {
        if (showNotebooks) fetchNotebooks();
    }, [showNotebooks, fetchNotebooks]);

    // ── Notebook CRUD ──────────────────────────────────────────────────────

    async function handleCreateNotebook() {
        if (creatingNotebook) return;
        setCreatingNotebook(true);
        try {
            const token = getToken();
            const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!userRes.ok) throw new Error("Erro ao obter usuário");
            const userData = await userRes.json();
            const idUser = userData[0]?.id;

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notebook`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ nameNotebook: "Sem título", idUser }),
            });
            if (!res.ok) throw new Error("Erro ao criar notebook");
            const data = await res.json();
            const newNotebook = Array.isArray(data) ? data[0] : data[0];
            setNotebooks((prev) => [...prev, newNotebook]);
            selectNotebook(newNotebook.id);
            router.push("/content/cards");
        } catch (err) {
            console.error(err);
            alert("Erro ao criar notebook!");
        } finally {
            setCreatingNotebook(false);
        }
    }

    async function handleRenameNotebook(id: string, newName: string) {
        if (!newName.trim()) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notebook/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newName: newName.trim() }),
            });
            if (!res.ok) throw new Error("Erro ao renomear notebook");
            setNotebooks((prev) =>
                prev.map((nb) => (nb.id === id ? { ...nb, name: newName.trim() } : nb))
            );
        } catch (err) {
            console.error(err);
            alert("Erro ao renomear notebook!");
        } finally {
            setRenamingNotebook(null);
        }
    }

    async function handleDeleteNotebook(id: string) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notebook/${id}`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
            });
            if (!res.ok) throw new Error("Erro ao excluir notebook");
            setNotebooks((prev) => prev.filter((nb) => nb.id !== id));
            if (selectedNotebookId === id) {
                const remaining = notebooks.filter((nb) => nb.id !== id);
                selectNotebook(remaining.length > 0 ? remaining[0].id : null);
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao excluir notebook!");
        }
    }

    function submitRenameNotebook() {
        if (!renamingNotebook) return;
        handleRenameNotebook(renamingNotebook.id, renamingNotebook.value);
    }

    // ── Filtered notebooks ─────────────────────────────────────────────────

    const filteredNotebooks = searchQuery
        ? notebooks.filter((nb) => nb.name.toLowerCase().includes(searchQuery.toLowerCase()))
        : notebooks;

    // ── Render ─────────────────────────────────────────────────────────────

    return (
        <div className={`${styles.wrapper} ${sidebarOpen ? styles.wrapperOpen : styles.wrapperClosed}`}>

            <aside className={`${styles.containerSideBar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>

                {/* Top bar */}
                <div className={styles.topBar}>
                    <div className={styles.menuWrapper} ref={menuWrapperRef}>
                        <div
                            className={`${styles.menuIcon} ${tooltipOpen ? styles.menuIconActive : ""}`}
                            onClick={() => setTooltipOpen((prev) => !prev)}
                        >
                            <MenuIcon />
                        </div>

                        <div
                            ref={tooltipRef}
                            className={`${styles.tooltip} ${tooltipOpen ? styles.tooltipShow : styles.tooltipHide}`}
                            role="menu"
                        >
                            {NAV_ITEMS.map((item) => {
                                const isActive = activeId === item.id;
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        role="menuitem"
                                        className={`${styles.tooltipItem} ${isActive ? styles.tooltipItemActive : ""}`}
                                        onClick={() => { setActiveId(item.id); setTooltipOpen(false); }}
                                    >
                                        <span className={styles.tooltipIcon}>{item.icon}</span>
                                        <span className={styles.tooltipLabel}>{item.label}</span>
                                        {isActive && <span className={styles.activeDot} />}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Search bar */}
                    <div className={styles.search}>
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder={
                                showNotebooks ? "Pesquisar notebooks…"
                                : showNotes   ? "Pesquisar notas…"
                                : "Pesquisar…"
                            }
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <button
                                className={styles.searchClear}
                                onClick={() => { setSearchQuery(""); searchInputRef.current?.focus(); }}
                                tabIndex={-1}
                            >
                                <ClearIcon />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Sidebar body ── */}
                <div className={styles.sidebarContent}>

                    {/* NOTEBOOKS — only on /content/cards */}
                    {showNotebooks && (
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <span className={styles.sectionTitle}>NOTEBOOKS</span>
                                <button
                                    className={styles.sectionAction}
                                    onClick={handleCreateNotebook}
                                    disabled={creatingNotebook}
                                    title="Novo notebook"
                                >
                                    <PlusIcon />
                                </button>
                            </div>
                            <div className={styles.notebookList}>
                                {notebooksLoading ? (
                                    <div className={styles.sectionLoading}>Carregando…</div>
                                ) : filteredNotebooks.length === 0 ? (
                                    <div className={styles.sectionEmpty}>
                                        {searchQuery ? "Nenhum resultado." : "Nenhum notebook ainda."}
                                    </div>
                                ) : (
                                    filteredNotebooks.map((nb) => {
                                        const isActive    = nb.id === selectedNotebookId;
                                        const isRenaming  = renamingNotebook?.id === nb.id;
                                        const isMenuOpen  = notebookMenu === nb.id;

                                        return (
                                            <div
                                                key={nb.id}
                                                className={`${styles.notebookItem} ${isActive ? styles.notebookItemActive : ""}`}
                                            >
                                                {isRenaming ? (
                                                    <>
                                                        <span className={styles.notebookItemIcon}>
                                                            <NotebookIcon />
                                                        </span>
                                                        <input
                                                            ref={renameInputRef}
                                                            className={styles.notebookRenameInput}
                                                            value={renamingNotebook.value}
                                                            onChange={(e) =>
                                                                setRenamingNotebook((p) =>
                                                                    p ? { ...p, value: e.target.value } : null
                                                                )
                                                            }
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter") submitRenameNotebook();
                                                                if (e.key === "Escape") setRenamingNotebook(null);
                                                            }}
                                                            onBlur={submitRenameNotebook}
                                                        />
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className={styles.notebookItemBtn}
                                                            onClick={() => selectNotebook(nb.id)}
                                                        >
                                                            <span className={styles.notebookItemIcon}>
                                                                <NotebookIcon />
                                                            </span>
                                                            <span className={styles.notebookItemName}>
                                                                <HighlightedText text={nb.name} query={searchQuery} />
                                                            </span>
                                                        </button>

                                                        <div className={styles.notebookMenuWrapper}>
                                                            <button
                                                                className={styles.notebookDotsBtn}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setNotebookMenu(isMenuOpen ? null : nb.id);
                                                                }}
                                                            >
                                                                <DotsIcon />
                                                            </button>
                                                            {isMenuOpen && (
                                                                <div className={styles.notebookActionMenu}>
                                                                    <button
                                                                        className={styles.notebookMenuItem}
                                                                        onClick={() => {
                                                                            setRenamingNotebook({ id: nb.id, value: nb.name });
                                                                            setNotebookMenu(null);
                                                                        }}
                                                                    >
                                                                        Renomear
                                                                    </button>
                                                                    <button
                                                                        className={`${styles.notebookMenuItem} ${styles.notebookMenuItemDanger}`}
                                                                        onClick={() => {
                                                                            setNotebookMenu(null);
                                                                            handleDeleteNotebook(nb.id);
                                                                        }}
                                                                    >
                                                                        Excluir
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {/* NOTES — only on /content/notes */}
                    {showNotes && <NotesSidebarSection searchQuery={searchQuery} />}

                </div>
            </aside>

            {/* Toggle button */}
            <button
                className={`${styles.toggleBtn} ${sidebarOpen ? styles.toggleBtnOpen : styles.toggleBtnClosed}`}
                onClick={() => { handleToggle(); setTooltipOpen(false); }}
                aria-label={sidebarOpen ? "Fechar sidebar" : "Abrir sidebar"}
            >
                {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </button>
        </div>
    );
}