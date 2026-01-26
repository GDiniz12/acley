import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import styles from "./style.module.css";

interface NotebookComponentProps {
    link: string;
    title: string;
    onRename: () => void;
    onDelete: () => void;
}

export default function NotebookComponent({ link, title, onRename, onDelete }: NotebookComponentProps) {
    const [showOptions, setShowOptions] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowOptions(false);
            }
        }

        if (showOptions) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptions]);

    function toggleOptions(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setShowOptions(!showOptions);
    }

    function handleRename(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setShowOptions(false);
        onRename();
    }

    function handleDelete(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setShowOptions(false);
        onDelete();
    }

    return (
        <div className={styles.container}>
            <p>
                <Link href={`/content/${link}`}>{title}</Link>
            </p>
            <div className={styles.menuWrapper} ref={menuRef}>
                <span className={styles.dotsMenu} onClick={toggleOptions}>
                    <span>.</span>
                    <span>.</span>
                    <span>.</span>
                </span>
                {showOptions && (
                    <div className={styles.optionsMenu}>
                        <button onClick={handleRename} className={styles.optionButton}>
                            Renomear
                        </button>
                        <button onClick={handleDelete} className={styles.optionButton}>
                            Excluir
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}