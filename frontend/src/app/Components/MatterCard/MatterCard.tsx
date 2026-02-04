import { useState, useRef, useEffect } from "react";
import styles from "./style.module.css";

interface SubMatter {
    id: string;
    name: string;
}

interface MatterCardProps {
    id: number;
    name: string;
    newCards?: number;
    learningCards?: number;
    reviewCards?: number;
    onRename: () => void;
    onDelete: () => void;
    hasSubMatters?: boolean;
}

export default function MatterCard({ 
    id, 
    name, 
    newCards = 0, 
    learningCards = 0, 
    reviewCards = 0,
    onRename,
    onDelete,
    hasSubMatters = false
}: MatterCardProps) {
    const [showOptions, setShowOptions] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [subMatters, setSubMatters] = useState<SubMatter[]>([]);
    const [loadingSubMatters, setLoadingSubMatters] = useState(false);
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

    async function fetchSubMatters() {
        setLoadingSubMatters(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submatter/parent/${id}`);

            if (!res.ok) {
                throw new Error('Erro ao carregar submatérias');
            }

            const data = await res.json();
            setSubMatters(data || []);
        } catch(err) {
            console.error("Erro ao buscar submatérias:", err);
            setSubMatters([]);
        } finally {
            setLoadingSubMatters(false);
        }
    }

    function handleToggleExpand(e: React.MouseEvent) {
        e.stopPropagation();
        
        if (!isExpanded && subMatters.length === 0) {
            fetchSubMatters();
        }
        
        setIsExpanded(!isExpanded);
    }
    
    function handleMatterClick() {
        console.log(`Clicked on matter: ${name} (ID: ${id})`);
    }

    function toggleOptions(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setShowOptions(!showOptions);
    }

    function handleRenameClick(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setShowOptions(false);
        onRename();
    }

    function handleDeleteClick(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();
        setShowOptions(false);
        onDelete();
    }

    function handleSubMatterClick(subMatter: SubMatter) {
        console.log(`Clicked on submatter: ${subMatter.name} (ID: ${subMatter.id})`);
    }

    return (
        <>
            <div className={styles.matterCard} onClick={handleMatterClick}>
                <div className={styles.leftSide}>
                    {hasSubMatters && (
                        <button 
                            className={styles.expandButton}
                            onClick={handleToggleExpand}
                        >
                            {isExpanded ? '−' : '+'}
                        </button>
                    )}
                    <span className={styles.matterName} title={name}>{name}</span>
                </div>
                
                <div className={styles.rightSide}>
                    <div className={styles.matterStats}>
                        <span className={styles.statNew}>{newCards}</span>
                        <span className={styles.statLearning}>{learningCards}</span>
                        <span className={styles.statReview}>{reviewCards}</span>
                    </div>
                </div>

                <div className={styles.menuWrapper} ref={menuRef}>
                    <div className={styles.dotsMenu} onClick={toggleOptions}>
                        <div className={styles.dot}></div>
                        <div className={styles.dot}></div>
                        <div className={styles.dot}></div>
                    </div>
                    
                    {showOptions && (
                        <div className={styles.optionsMenu}>
                            <button onClick={handleRenameClick} className={styles.optionButton}>
                                Renomear
                            </button>
                            <button onClick={handleDeleteClick} className={`${styles.optionButton} ${styles.delete}`}>
                                Excluir
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Submatérias */}
            {isExpanded && (
                <div className={styles.subMattersContainer}>
                    {loadingSubMatters ? (
                        <div className={styles.loadingSubMatters}>Carregando...</div>
                    ) : subMatters.length === 0 ? (
                        <div className={styles.noSubMatters}>Nenhuma submatéria encontrada</div>
                    ) : (
                        subMatters.map((subMatter) => (
                            <div 
                                key={subMatter.id}
                                className={styles.subMatterCard}
                                onClick={() => handleSubMatterClick(subMatter)}
                            >
                                <span className={styles.subMatterName}>{subMatter.name}</span>
                                <div className={styles.subMatterStats}>
                                    <span className={styles.statNew}>0</span>
                                    <span className={styles.statLearning}>0</span>
                                    <span className={styles.statReview}>0</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </>
    );
}