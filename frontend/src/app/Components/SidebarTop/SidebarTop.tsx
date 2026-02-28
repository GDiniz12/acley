import React, { useState } from "react";
import GlassBox from "../GlassBox/GlassBox";
import styles from "./SidebarTop.module.css";
import Link from "next/link";

const HomeIcon = () => (
    <Link href="/home" className={styles.link}>
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/>
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
    </Link>
);

const NotesIcon = () => (
    <Link href="/notes" className={styles.link}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 7v14"/><path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z"/></svg>
    </Link>
);

const TutorIcon = () => (
    <Link href="/tutor" className={styles.link}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>
    </Link>
);

const CardIcon = () => (
    <Link href="/flashcards" className={styles.link}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
    </Link>
);

const TooltipIcon = ({ icon, label }: { icon: React.ReactNode; label: string }) => (
    <div className={styles.tooltipWrapper}>
        {icon}
        <span className={styles.tooltip}>{label}</span>
    </div>
);

export default function SidebarTop() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
            className={styles.glassBox}
        >
            <GlassBox
                width={"120%"}
                height={isOpen ? "3rem" : "0.5rem"}
                onMouseEnter={() => setIsOpen(true)}
                onMouseLeave={() => setIsOpen(false)}
            >
                <TooltipIcon icon={<HomeIcon />} label="Home" />
                <TooltipIcon icon={<NotesIcon />} label="Notes" />
                <TooltipIcon icon={<TutorIcon />} label="AI Tutor" />
                <TooltipIcon icon={<CardIcon />} label="Flashcards" />
            </GlassBox>
        </div>
    );
}
