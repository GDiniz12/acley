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
    refreshTrigger?: number; // Para forçar atualização quando criar nova matéria
}

export default function MainDeck({ notebookId, refreshTrigger }: MainDeckProps) {
    const [matters, setMatters] = useState<Matter[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
            } catch(err) {
                console.error("Erro ao buscar matérias:", err);
                setMatters([]);
            } finally {
                setIsLoading(false);
            }
        }

        fetchMatters();
    }, [notebookId, refreshTrigger]);

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
                            />
                        ))
                    )}
                </div>
            </div>
        </>
    );
}