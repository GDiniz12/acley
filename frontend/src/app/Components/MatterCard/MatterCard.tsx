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
    onSubMatterUpdate?: () => void;
}

export default function MatterCard({ 
    id, 
    name, 
    newCards = 0, 
    learningCards = 0, 
    reviewCards = 0,
    onRename,
    onDelete,
    hasSubMatters = false,
    onSubMatterUpdate
}: MatterCardProps) {
    const [showOptions, setShowOptions] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [subMatters, setSubMatters] = useState<SubMatter[]>([]);
    const [loadingSubMatters, setLoadingSubMatters] = useState(false);
    
    // Estados para submatérias
    const [selectedSubMatter, setSelectedSubMatter] = useState<SubMatter | null>(null);
    const [showSubMatterModal, setShowSubMatterModal] = useState(false);
    const [subMatterModalType, setSubMatterModalType] = useState<'rename' | 'delete'>('rename');
    const [newSubMatterName, setNewSubMatterName] = useState('');
    const [activeSubMatterMenu, setActiveSubMatterMenu] = useState<string | null>(null);
    
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

    // Funções para submatérias
    function toggleSubMatterOptions(e: React.MouseEvent, subMatterId: string) {
        e.preventDefault();
        e.stopPropagation();
        setActiveSubMatterMenu(activeSubMatterMenu === subMatterId ? null : subMatterId);
    }

    function handleOpenRenameSubMatter(e: React.MouseEvent, subMatter: SubMatter) {
        e.preventDefault();
        e.stopPropagation();
        setSelectedSubMatter(subMatter);
        setNewSubMatterName(subMatter.name);
        setSubMatterModalType('rename');
        setShowSubMatterModal(true);
        setActiveSubMatterMenu(null);
    }

    function handleOpenDeleteSubMatter(e: React.MouseEvent, subMatter: SubMatter) {
        e.preventDefault();
        e.stopPropagation();
        setSelectedSubMatter(subMatter);
        setSubMatterModalType('delete');
        setShowSubMatterModal(true);
        setActiveSubMatterMenu(null);
    }

    function handleCloseSubMatterModal() {
        setShowSubMatterModal(false);
        setSelectedSubMatter(null);
        setNewSubMatterName('');
    }

    async function handleRenameSubMatter() {
        if (!selectedSubMatter || !newSubMatterName.trim()) {
            alert("Por favor, insira um nome válido!");
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submatter`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idSubMatter: selectedSubMatter.id,
                    newName: newSubMatterName.trim()
                })
            });

            if (!res.ok) {
                throw new Error('Erro ao renomear submatéria');
            }

            setSubMatters(prev => 
                prev.map(sm => 
                    sm.id === selectedSubMatter.id 
                        ? { ...sm, name: newSubMatterName.trim() }
                        : sm
                )
            );

            handleCloseSubMatterModal();
            
            if (onSubMatterUpdate) {
                onSubMatterUpdate();
            }
        } catch(err) {
            console.error(err);
            alert("Erro ao renomear submatéria!");
        }
    }

    async function handleDeleteSubMatter() {
        if (!selectedSubMatter) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submatter`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idSubMatter: selectedSubMatter.id
                })
            });

            if (!res.ok) {
                throw new Error('Erro ao excluir submatéria');
            }

            setSubMatters(prev => prev.filter(sm => sm.id !== selectedSubMatter.id));
            handleCloseSubMatterModal();
            
            if (onSubMatterUpdate) {
                onSubMatterUpdate();
            }
        } catch(err) {
            console.error(err);
            alert("Erro ao excluir submatéria!");
        }
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
                                
                                {/* Menu de opções da submatéria */}
                                <div className={styles.subMenuWrapper}>
                                    <div 
                                        className={styles.dotsMenu} 
                                        onClick={(e) => toggleSubMatterOptions(e, subMatter.id)}
                                    >
                                        <div className={styles.dot}></div>
                                        <div className={styles.dot}></div>
                                        <div className={styles.dot}></div>
                                    </div>
                                    
                                    {activeSubMatterMenu === subMatter.id && (
                                        <div className={styles.optionsMenu}>
                                            <button 
                                                onClick={(e) => handleOpenRenameSubMatter(e, subMatter)}
                                                className={styles.optionButton}
                                            >
                                                Renomear
                                            </button>
                                            <button 
                                                onClick={(e) => handleOpenDeleteSubMatter(e, subMatter)}
                                                className={`${styles.optionButton} ${styles.delete}`}
                                            >
                                                Excluir
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Modal para Renomear/Excluir Submatéria */}
            {showSubMatterModal && (
                <div 
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                    }} 
                    onClick={handleCloseSubMatterModal}
                >
                    <div 
                        style={{
                            backgroundColor: '#1e1e1e', padding: '2rem', borderRadius: '12px',
                            width: '400px', maxWidth: '90%', border: '1px solid #333'
                        }} 
                        onClick={(e) => e.stopPropagation()}
                    >
                        {subMatterModalType === 'rename' ? (
                            <>
                                <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Renomear Submatéria</h2>
                                <p style={{ marginBottom: '1rem', color: '#aaa' }}>Digite o novo nome da submatéria</p>
                                <input 
                                    type="text" 
                                    value={newSubMatterName}
                                    onChange={(e) => setNewSubMatterName(e.target.value)}
                                    placeholder="Nome da submatéria"
                                    style={{
                                        width: '100%', padding: '0.8rem', borderRadius: '6px',
                                        border: '1px solid #444', backgroundColor: '#2d2d2d',
                                        color: '#fff', marginBottom: '1.5rem'
                                    }}
                                    autoFocus
                                />
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button 
                                        onClick={handleRenameSubMatter}
                                        style={{
                                            padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none',
                                            backgroundColor: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer'
                                        }}
                                    >
                                        Confirmar
                                    </button>
                                    <button 
                                        onClick={handleCloseSubMatterModal}
                                        style={{
                                            padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid #555',
                                            backgroundColor: 'transparent', color: '#fff', cursor: 'pointer'
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Excluir Submatéria</h2>
                                <p style={{ marginBottom: '1rem', color: '#aaa' }}>
                                    Tem certeza que deseja excluir a submatéria "<strong>{selectedSubMatter?.name}</strong>"?
                                </p>
                                <p style={{ color: '#ff4444', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                                    Esta ação não pode ser desfeita.
                                </p>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button 
                                        onClick={handleDeleteSubMatter}
                                        style={{
                                            padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none',
                                            backgroundColor: '#ff4444', color: '#fff', fontWeight: 'bold', cursor: 'pointer'
                                        }}
                                    >
                                        Excluir
                                    </button>
                                    <button 
                                        onClick={handleCloseSubMatterModal}
                                        style={{
                                            padding: '0.6rem 1.2rem', borderRadius: '6px', border: '1px solid #555',
                                            backgroundColor: 'transparent', color: '#fff', cursor: 'pointer'
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}