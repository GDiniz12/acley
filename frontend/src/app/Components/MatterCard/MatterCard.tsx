import { useState, useRef, useEffect } from "react";
import styles from "./style.module.css";

interface MatterCardProps {
    id: number;
    name: string;
    newCards?: number;
    learningCards?: number;
    reviewCards?: number;
    onRename: () => void;
    onDelete: () => void;
}

export default function MatterCard({ 
    id, 
    name, 
    newCards = 0, 
    learningCards = 0, 
    reviewCards = 0,
    onRename,
    onDelete
}: MatterCardProps) {
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

    return (
        <div className={styles.matterCard} onClick={handleMatterClick}>
            <span className={styles.matterName} title={name}>{name}</span>
            
            <div className={styles.rightSide}>
                <div className={styles.matterStats}>
                    <span className={styles.statNew}>{newCards}</span>
                    <span className={styles.statLearning}>{learningCards}</span>
                    <span className={styles.statReview}>{reviewCards}</span>
                </div>
            </div>

            {/* Menu Wrapper agora está fora do rightSide e posicionado absolutamente */}
            <div className={styles.menuWrapper} ref={menuRef}>
                {/* Estrutura atualizada para os pontinhos */}
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
                        {/* Adicionei uma classe específica para o botão de excluir para estilizar o hover em vermelho */}
                        <button onClick={handleDeleteClick} className={`${styles.optionButton} ${styles.delete}`}>
                            Excluir
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}