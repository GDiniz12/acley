'use client'

import { useState, useEffect } from "react";
import styles from "./style.module.css";

interface Matter {
    id: number;
    name: string;
}

interface CreateSubMatterModalProps {
    showModal: boolean;
    onClose: () => void;
    onConfirm: (subMatterName: string, parentMatterId: number) => Promise<void>;
    notebookId: string;
}

export default function CreateSubMatterModal({ 
    showModal, 
    onClose, 
    onConfirm, 
    notebookId 
}: CreateSubMatterModalProps) {
    const [subMatterName, setSubMatterName] = useState('');
    const [selectedParent, setSelectedParent] = useState<number | null>(null);
    const [matters, setMatters] = useState<Matter[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMatters, setLoadingMatters] = useState(false);

    useEffect(() => {
        if (showModal) {
            fetchMatters();
        }
    }, [showModal, notebookId]);

    async function fetchMatters() {
        setLoadingMatters(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matter/notebook/${notebookId}`);

            if (!res.ok) {
                throw new Error('Erro ao carregar matérias');
            }

            const data = await res.json();
            setMatters(data || []);
        } catch(err) {
            console.error("Erro ao buscar matérias:", err);
            alert("Erro ao carregar matérias!");
        } finally {
            setLoadingMatters(false);
        }
    }

    async function handleConfirm() {
        if (!subMatterName.trim()) {
            alert("Por favor, insira um nome válido!");
            return;
        }

        if (!selectedParent) {
            alert("Por favor, selecione uma matéria pai!");
            return;
        }

        setIsLoading(true);
        try {
            await onConfirm(subMatterName.trim(), selectedParent);
            setSubMatterName('');
            setSelectedParent(null);
            onClose();
        } catch (err) {
            console.error(err);
            alert("Erro ao criar submatéria!");
        } finally {
            setIsLoading(false);
        }
    }

    function handleClose() {
        setSubMatterName('');
        setSelectedParent(null);
        onClose();
    }

    if (!showModal) return null;

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>Criar Nova Submatéria</h2>
                
                <div className={styles.formSection}>
                    <label className={styles.label}>Selecione a matéria pai</label>
                    {loadingMatters ? (
                        <div className={styles.loading}>Carregando matérias...</div>
                    ) : matters.length === 0 ? (
                        <div className={styles.emptyMessage}>
                            Nenhuma matéria disponível. Crie uma matéria primeiro!
                        </div>
                    ) : (
                        <div className={styles.mattersList}>
                            {matters.map((matter) => (
                                <div
                                    key={matter.id}
                                    className={`${styles.matterItem} ${
                                        selectedParent === matter.id ? styles.selected : ''
                                    }`}
                                    onClick={() => setSelectedParent(matter.id)}
                                >
                                    <div className={styles.radio}>
                                        {selectedParent === matter.id && <div className={styles.radioInner} />}
                                    </div>
                                    <span>{matter.name}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className={styles.formSection}>
                    <label className={styles.label}>Nome da submatéria</label>
                    <input 
                        type="text" 
                        value={subMatterName}
                        onChange={(e) => setSubMatterName(e.target.value)}
                        placeholder="Digite o nome da submatéria"
                        className={styles.modalInput}
                        disabled={isLoading || !selectedParent}
                    />
                </div>

                <div className={styles.modalButtons}>
                    <button 
                        onClick={handleConfirm}
                        className={styles.confirmButton}
                        disabled={isLoading || !selectedParent || !subMatterName.trim()}
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