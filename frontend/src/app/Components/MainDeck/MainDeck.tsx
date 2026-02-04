'use client'

import { useState, useEffect } from "react";
import styles from "./style.module.css";
import MatterCard from "../MatterCard/MatterCard";

interface Matter {
    id: number;
    name: string;
}

interface MainDeckProps {
    notebookId: string;
    refreshTrigger?: number;
}

export default function MainDeck({ notebookId, refreshTrigger }: MainDeckProps) {
    const [matters, setMatters] = useState<Matter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mattersWithSubMatters, setMattersWithSubMatters] = useState<Set<number>>(new Set());
    
    // Estados para o Modal de Renomear/Excluir
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
                
                // Verifica quais matérias têm submatérias
                await checkMattersWithSubMatters(data || []);
            } catch(err) {
                console.error("Erro ao buscar matérias:", err);
                setMatters([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchMatters();
    }, [notebookId, refreshTrigger]);

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

    // Função para atualizar quando uma nova submatéria é criada
    function handleSubMatterCreated(parentMatterId: number) {
        setMattersWithSubMatters(prev => new Set(prev).add(parentMatterId));
    }

    // Funções de Abertura de Modal
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

    // Funções de API
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
                            Nenhuma matéria criada ainda. Clique em "Criar matéria" para começar!
                        </div>
                    ) : (
                        matters.map((matter) => (
                            <MatterCard 
                                key={matter.id}
                                id={matter.id}
                                name={matter.name}
                                newCards={0}
                                learningCards={0}
                                reviewCards={0}
                                onRename={() => handleOpenRenameModal(matter)}
                                onDelete={() => handleOpenDeleteModal(matter)}
                                hasSubMatters={mattersWithSubMatters.has(matter.id)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Renomear/Excluir */}
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
                                <p style={{ marginBottom: '1rem', color: '#aaa' }}>Tem certeza que deseja excluir a matéria "<strong>{selectedMatter?.name}</strong>"?</p>
                                <p style={{ color: '#ff4444', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Esta ação não pode ser desfeita.</p>
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