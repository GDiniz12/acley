'use client'

import { useState, useEffect } from "react";
import styles from "./style.module.css";
import MatterCard from "../MatterCard/MatterCard";
import ReviewModal from "../ReviewModal/ReviewModal";

interface Matter {
    id: number;
    name: string;
}

interface CardCounts {
    new: number;
    learn: number;
    review: number;
}

interface MainDeckProps {
    notebookId: string;
    refreshTrigger?: number;
}

export default function MainDeck({ notebookId, refreshTrigger }: MainDeckProps) {
    const [matters, setMatters] = useState<Matter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mattersWithSubMatters, setMattersWithSubMatters] = useState<Set<number>>(new Set());
    const [cardCounts, setCardCounts] = useState<Map<number, CardCounts>>(new Map());
    
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedMatterForReview, setSelectedMatterForReview] = useState<{ 
        id: number, 
        name: string,
        isSubMatter: boolean 
    } | null>(null);
    
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState<'rename' | 'delete'>('rename');
    const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
    const [newName, setNewName] = useState('');

    useEffect(() => {
        async function fetchMatters() {
            if (!notebookId) return;

            setIsLoading(true);
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matter/notebook/${notebookId}`);

                if (!res.ok) {
                    throw new Error('Erro ao carregar matérias');
                }

                const data = await res.json();
                setMatters(data || []);
                
                await checkMattersWithSubMatters(data || []);
                await fetchCardCounts(data || []);
            } catch(err) {
                console.error("Erro ao buscar matérias:", err);
                setMatters([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchMatters();
    }, [notebookId, refreshTrigger]);

    async function fetchCardCounts(matters: Matter[]) {
        const countsMap = new Map<number, CardCounts>();
        
        for (const matter of matters) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/card/count/matter/${matter.id}`);
                if (res.ok) {
                    const counts = await res.json();
                    countsMap.set(matter.id, counts);
                }
            } catch(err) {
                console.error(`Erro ao buscar contagem de cards da matéria ${matter.id}:`, err);
                countsMap.set(matter.id, { new: 0, learn: 0, review: 0 });
            }
        }
        
        setCardCounts(countsMap);
    }

    async function checkMattersWithSubMatters(matters: Matter[]) {
        const mattersWithSubs = new Set<number>();
        
        for (const matter of matters) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submatter/parent/${matter.id}`);
                if (res.ok) {
                    const subMatters = await res.json();
                    if (subMatters && subMatters.length > 0) {
                        mattersWithSubs.add(matter.id);
                    }
                }
            } catch(err) {
                console.error(`Erro ao verificar submatérias da matéria ${matter.id}:`, err);
            }
        }
        
        setMattersWithSubMatters(mattersWithSubs);
    }

    function handleSubMatterUpdate(parentMatterId: number) {
        checkMattersWithSubMatters(matters);
    }

    function handleCardUpdate() {
        fetchCardCounts(matters);
    }

    function handleOpenReview(matterId: number, matterName: string, isSubMatter: boolean = false) {
        setSelectedMatterForReview({ id: matterId, name: matterName, isSubMatter });
        setShowReviewModal(true);
    }

    function handleCloseReview() {
        setShowReviewModal(false);
        setSelectedMatterForReview(null);
    }

    function handleReviewComplete() {
        fetchCardCounts(matters);
    }

    function handleOpenRenameModal(matter: Matter) {
        setSelectedMatter(matter);
        setNewName(matter.name);
        setModalType('rename');
        setShowModal(true);
    }

    function handleOpenDeleteModal(matter: Matter) {
        setSelectedMatter(matter);
        setModalType('delete');
        setShowModal(true);
    }

    function handleCloseModal() {
        setShowModal(false);
        setSelectedMatter(null);
        setNewName('');
    }

    async function handleRenameMatter() {
        if (!selectedMatter || !newName.trim()) {
            alert("Por favor, insira um nome válido!");
            return;
        }

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matter`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idMatter: selectedMatter.id,
                    NewName: newName.trim()
                })
            });

            if (!res.ok) {
                throw new Error('Erro ao renomear matéria');
            }

            setMatters(prev => 
                prev.map(m => 
                    m.id === selectedMatter.id 
                        ? { ...m, name: newName.trim() }
                        : m
                )
            );

            handleCloseModal();
        } catch(err) {
            console.error(err);
            alert("Erro ao renomear matéria!");
        }
    }

    async function handleDeleteMatter() {
        if (!selectedMatter) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matter`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idMatter: selectedMatter.id
                })
            });

            if (!res.ok) {
                throw new Error('Erro ao excluir matéria');
            }

            setMatters(prev => prev.filter(m => m.id !== selectedMatter.id));
            setMattersWithSubMatters(prev => {
                const newSet = new Set(prev);
                newSet.delete(selectedMatter.id);
                return newSet;
            });
            setCardCounts(prev => {
                const newMap = new Map(prev);
                newMap.delete(selectedMatter.id);
                return newMap;
            });
            handleCloseModal();
        } catch(err) {
            console.error(err);
            alert("Erro ao excluir matéria!");
        }
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.top}>
                    <span><h4>Matérias</h4></span>
                    <span className={styles.status}>
                        <h5>Novo</h5>
                        <h5>Aprender</h5>
                        <h5>Revisar</h5>
                    </span>
                </div>
                <div className={styles.mattersContent}>
                    {isLoading ? (
                        <div className={styles.loadingMessage}>Carregando matérias...</div>
                    ) : matters.length === 0 ? (
                        <div className={styles.emptyMessage}>
                            Nenhuma matéria criada ainda. Clique em &quot;Criar matéria&quot; para começar!
                        </div>
                    ) : (
                        matters.map((matter) => {
                            const counts = cardCounts.get(matter.id) || { new: 0, learn: 0, review: 0 };
                            return (
                                <MatterCard 
                                    key={matter.id}
                                    id={matter.id}
                                    name={matter.name}
                                    newCards={counts.new}
                                    learningCards={counts.learn}
                                    reviewCards={counts.review}
                                    onRename={() => handleOpenRenameModal(matter)}
                                    onDelete={() => handleOpenDeleteModal(matter)}
                                    hasSubMatters={mattersWithSubMatters.has(matter.id)}
                                    onSubMatterUpdate={() => handleSubMatterUpdate(matter.id)}
                                    onCardUpdate={handleCardUpdate}
                                    onOpenReview={handleOpenReview}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            {showReviewModal && selectedMatterForReview && (
                <ReviewModal 
                    showModal={showReviewModal}
                    onClose={handleCloseReview}
                    matterId={selectedMatterForReview.id}
                    matterName={selectedMatterForReview.name}
                    isSubMatter={selectedMatterForReview.isSubMatter}
                    onReviewComplete={handleReviewComplete}
                />
            )}

            {showModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }} onClick={handleCloseModal}>
                    <div style={{
                        backgroundColor: '#1e1e1e', padding: '2rem', borderRadius: '12px',
                        width: '400px', maxWidth: '90%', border: '1px solid #333'
                    }} onClick={(e) => e.stopPropagation()}>
                        {modalType === 'rename' ? (
                            <>
                                <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Renomear Matéria</h2>
                                <p style={{ marginBottom: '1rem', color: '#aaa' }}>Digite o novo nome da matéria</p>
                                <input 
                                    type="text" 
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Nome da matéria"
                                    style={{
                                        width: '100%', padding: '0.8rem', borderRadius: '6px',
                                        border: '1px solid #444', backgroundColor: '#2d2d2d',
                                        color: '#fff', marginBottom: '1.5rem'
                                    }}
                                    autoFocus
                                />
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button 
                                        onClick={handleRenameMatter}
                                        style={{
                                            padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none',
                                            backgroundColor: '#fff', color: '#000', fontWeight: 'bold', cursor: 'pointer'
                                        }}
                                    >
                                        Confirmar
                                    </button>
                                    <button 
                                        onClick={handleCloseModal}
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
                                <h2 style={{ marginBottom: '1rem', color: '#fff' }}>Excluir Matéria</h2>
                                <p style={{ marginBottom: '1rem', color: '#aaa' }}>
                                    Tem certeza que deseja excluir a matéria{' '}
                                    <strong>&quot;{selectedMatter?.name}&quot;</strong>?
                                </p>
                                <p style={{ color: '#ff4444', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Esta ação não pode ser desfeita e todas as submatérias serão excluídas também.</p>
                                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                                    <button 
                                        onClick={handleDeleteMatter}
                                        style={{
                                            padding: '0.6rem 1.2rem', borderRadius: '6px', border: 'none',
                                            backgroundColor: '#ff4444', color: '#fff', fontWeight: 'bold', cursor: 'pointer'
                                        }}
                                    >
                                        Excluir
                                    </button>
                                    <button 
                                        onClick={handleCloseModal}
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