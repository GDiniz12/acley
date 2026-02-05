'use client'

import { useState, useEffect } from "react";
import styles from "./CreateCardModal.module.css";

interface Matter {
    id: number;
    name: string;
    type: 'matter' | 'submatter';
    parentId?: number;
}

interface CreateCardModalProps {
    showModal: boolean;
    onClose: () => void;
    onConfirm: (front: string, back: string, matterId: number, submatterId: number | null) => Promise<void>;
    notebookId: string;
}

export default function CreateCardModal({ 
    showModal, 
    onClose, 
    onConfirm, 
    notebookId 
}: CreateCardModalProps) {
    const [front, setFront] = useState('');
    const [back, setBack] = useState('');
    const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);
    const [allMatters, setAllMatters] = useState<Matter[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMatters, setLoadingMatters] = useState(false);

    useEffect(() => {
        if (showModal) {
            fetchAllMatters();
        }
    }, [showModal, notebookId]);

    async function fetchAllMatters() {
        setLoadingMatters(true);
        try {
            // Buscar matérias principais
            const resMatters = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matter/notebook/${notebookId}`);
            
            if (!resMatters.ok) {
                throw new Error('Erro ao carregar matérias');
            }

            const matters = await resMatters.json();
            const allMattersList: Matter[] = [];

            // Adicionar matérias principais
            for (const matter of matters || []) {
                allMattersList.push({
                    id: matter.id,
                    name: matter.name,
                    type: 'matter'
                });

                // Buscar submatérias de cada matéria
                try {
                    const resSubMatters = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submatter/parent/${matter.id}`);
                    
                    if (resSubMatters.ok) {
                        const subMatters = await resSubMatters.json();
                        
                        // Adicionar submatérias
                        for (const subMatter of subMatters || []) {
                            allMattersList.push({
                                id: subMatter.id,
                                name: `  ↳ ${subMatter.name}`,
                                type: 'submatter',
                                parentId: matter.id
                            });
                        }
                    }
                } catch (err) {
                    console.error(`Erro ao buscar submatérias da matéria ${matter.id}:`, err);
                }
            }

            setAllMatters(allMattersList);
        } catch(err) {
            console.error("Erro ao buscar matérias:", err);
            alert("Erro ao carregar matérias!");
        } finally {
            setLoadingMatters(false);
        }
    }

    async function handleConfirm() {
        if (!front.trim()) {
            alert("Por favor, preencha a frente do card!");
            return;
        }

        if (!back.trim()) {
            alert("Por favor, preencha o verso do card!");
            return;
        }

        if (!selectedMatter) {
            alert("Por favor, selecione uma matéria!");
            return;
        }

        setIsLoading(true);
        try {
            const matterId = selectedMatter.type === 'submatter' ? selectedMatter.parentId! : selectedMatter.id;
            const submatterId = selectedMatter.type === 'submatter' ? selectedMatter.id : null;

            await onConfirm(front.trim(), back.trim(), matterId, submatterId);
            
            // Limpar campos
            setFront('');
            setBack('');
            setSelectedMatter(null);
            onClose();
        } catch (err) {
            console.error(err);
            alert("Erro ao criar flashcard!");
        } finally {
            setIsLoading(false);
        }
    }

    function handleClose() {
        setFront('');
        setBack('');
        setSelectedMatter(null);
        onClose();
    }

    if (!showModal) return null;

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>Criar Novo Flashcard</h2>
                
                <div className={styles.formSection}>
                    <label className={styles.label}>Selecione a matéria</label>
                    {loadingMatters ? (
                        <div className={styles.loading}>Carregando matérias...</div>
                    ) : allMatters.length === 0 ? (
                        <div className={styles.emptyMessage}>
                            Nenhuma matéria disponível. Crie uma matéria primeiro!
                        </div>
                    ) : (
                        <div className={styles.mattersList}>
                            {allMatters.map((matter) => (
                                <div
                                    key={`${matter.type}-${matter.id}`}
                                    className={`${styles.matterItem} ${
                                        selectedMatter?.id === matter.id && selectedMatter?.type === matter.type
                                            ? styles.selected 
                                            : ''
                                    } ${matter.type === 'submatter' ? styles.submatterItem : ''}`}
                                    onClick={() => setSelectedMatter(matter)}
                                >
                                    <div className={styles.radio}>
                                        {selectedMatter?.id === matter.id && selectedMatter?.type === matter.type && (
                                            <div className={styles.radioInner} />
                                        )}
                                    </div>
                                    <span>{matter.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.formSection}>
                    <label className={styles.label}>Frente do card</label>
                    <textarea 
                        value={front}
                        onChange={(e) => setFront(e.target.value)}
                        placeholder="Digite a pergunta ou conceito"
                        className={styles.textarea}
                        rows={3}
                        disabled={isLoading || !selectedMatter}
                    />
                </div>

                <div className={styles.formSection}>
                    <label className={styles.label}>Verso do card</label>
                    <textarea 
                        value={back}
                        onChange={(e) => setBack(e.target.value)}
                        placeholder="Digite a resposta ou explicação"
                        className={styles.textarea}
                        rows={3}
                        disabled={isLoading || !selectedMatter}
                    />
                </div>

                <div className={styles.modalButtons}>
                    <button 
                        onClick={handleConfirm}
                        className={styles.confirmButton}
                        disabled={isLoading || !selectedMatter || !front.trim() || !back.trim()}
                    >
                        {isLoading ? 'Criando...' : 'Confirmar'}
                    </button>
                    <button 
                        onClick={handleClose}
                        className={styles.cancelButton}
                        disabled={isLoading}
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
}