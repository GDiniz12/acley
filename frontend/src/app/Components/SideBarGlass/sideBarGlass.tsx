"use client";

import { useState, useRef, useEffect } from "react";
import styles from "./style.module.css";
import Link from "next/link";
import { usePathname } from "next/navigation";

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

// ── Nav items ──────────────────────────────────────────────────────────────

const NAV_ITEMS = [
    { id: "profile",    label: "Perfil",        icon: <ProfileIcon />,    href: "/profile" },
    { id: "notes",      label: "Notas",          icon: <NotesIcon />,      href: "/content/notes" },
    { id: "flashcards", label: "Flashcards",     icon: <FlashcardsIcon />, href: "/cards" },
    { id: "ai-tutor",   label: "AI Tutor",       icon: <AITutorIcon />,    href: "/tutor" },
    { id: "settings",   label: "Configurações",  icon: <SettingsIcon />,   href: "/settings" },
] as const;

// ── Props ──────────────────────────────────────────────────────────────────

interface SideBarGlassProps {
    /** Controlled open state (optional). If omitted, component manages its own state. */
    isOpen?: boolean;
    /** Called when the toggle button is clicked (required when isOpen is provided). */
    onToggle?: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function SideBarGlass({ isOpen: isOpenProp, onToggle }: SideBarGlassProps) {
    // If isOpen is passed as a prop, use controlled mode; otherwise manage internally
    const [internalOpen, setInternalOpen] = useState(true);
    const sidebarOpen = isOpenProp !== undefined ? isOpenProp : internalOpen;

    function handleToggle() {
        if (onToggle) {
            onToggle();
        } else {
            setInternalOpen((prev) => !prev);
        }
    }

    const [tooltipOpen, setTooltipOpen] = useState(false);
    const [activeId, setActiveId] = useState<string>("notes");

    const tooltipRef = useRef<HTMLDivElement>(null);
    const menuWrapperRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (
                tooltipRef.current && !tooltipRef.current.contains(e.target as Node) &&
                menuWrapperRef.current && !menuWrapperRef.current.contains(e.target as Node)
            ) {
                setTooltipOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const match = NAV_ITEMS.find(item => pathname.startsWith(item.href));
        if (match) setActiveId(match.id);
    }, [pathname]);

    return (
        <div className={`${styles.wrapper} ${sidebarOpen ? styles.wrapperOpen : styles.wrapperClosed}`}>

            {/* ── SIDEBAR ────────────────────────────────────────────────── */}
            <aside className={`${styles.containerSideBar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>

                {/* Top bar: menu icon on left + search bar */}
                <div className={styles.topBar}>

                    {/* Menu icon with tooltip dropdown */}
                    <div className={styles.menuWrapper} ref={menuWrapperRef}>
                        <div
                            className={`${styles.menuIcon} ${tooltipOpen ? styles.menuIconActive : ""}`}
                            onClick={() => setTooltipOpen(prev => !prev)}
                        >
                            <MenuIcon />
                        </div>

                        {/* Tooltip dropdown */}
                        <div
                            ref={tooltipRef}
                            className={`${styles.tooltip} ${tooltipOpen ? styles.tooltipShow : styles.tooltipHide}`}
                            role="menu"
                        >
                            {NAV_ITEMS.map(item => {
                                const isActive = activeId === item.id;
                                return (
                                    <Link
                                        key={item.id}
                                        href={item.href}
                                        role="menuitem"
                                        className={`${styles.tooltipItem} ${isActive ? styles.tooltipItemActive : ""}`}
                                        onClick={() => {
                                            setActiveId(item.id);
                                            setTooltipOpen(false);
                                        }}
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
                        <input type="text" placeholder="Pesquisar" />
                    </div>
                </div>

                {/* Sidebar body */}
                <div className={styles.sidebarContent} />
            </aside>

            {/* ── OPEN/CLOSE TOGGLE ──────────────────────────────────────── */}
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