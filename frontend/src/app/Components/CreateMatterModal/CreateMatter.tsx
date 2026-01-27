'use client'

import { useState } from "react";
import styles from "./style.module.css";

interface CreateMatterModalProps {
    showModal: boolean;
    onClose: () => void;
    onConfirm: (matterName: string) => Promise<void>;
}

export default function CreateMatterModal({ showModal, onClose, onConfirm }: CreateMatterModalProps) {
    const [matterName, setMatterName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleConfirm() {
        if (!matterName.trim()) {
            alert("Por favor, insira um nome válido!");
            return;
        }

        setIsLoading(true);
        try {
            await onConfirm(matterName.trim());
            setMatterName('');
            onClose();
        } catch (err) {
            console.error(err);
            alert("Erro ao criar matéria!");
        } finally {
            setIsLoading(false);
        }
    }

    function handleClose() {
        setMatterName('');
        onClose();
    }

    if (!showModal) return null;

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <h2>Criar Nova Matéria</h2>
                <p>Digite o nome da matéria</p>
                <input 
                    type="text" 
                    value={matterName}
                    onChange={(e) => setMatterName(e.target.value)}
                    placeholder="Nome da matéria"
                    className={styles.modalInput}
                    autoFocus
                    disabled={isLoading}
                />
                <div className={styles.modalButtons}>
                    <button 
                        onClick={handleConfirm}
                        className={styles.confirmButton}
                        disabled={isLoading}
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