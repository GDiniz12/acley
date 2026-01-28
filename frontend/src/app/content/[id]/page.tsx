"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import MainDeck from "../../Components/MainDeck/MainDeck";
import ProtectedRoute from "../../Components/ProtectedRoute";
import SideBar from "../../Components/SideBar/SideBar";
import CreateMatterModal from "../../Components/CreateMatterModal/CreateMatter";
import styles from "./style.module.css";
import { getToken } from "../../signin/auth";
import "./style.module.css";

interface TypeCurrentNotebook {
    name: string;
}

function PageContent() {
    const [currentNotebook, setCurrentNotebook] = useState<TypeCurrentNotebook[]>([]);
    const [fetchLoaded, setFetchLoaded] = useState(false);
    const [showCreateMatterModal, setShowCreateMatterModal] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const params = useParams();
    
    // Pega o ID do notebook da URL
    const notebookId = params.id;

    // Busca o notebook específico quando o ID muda
    useEffect(() => {
        const fetchCurrentNotebook = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notebook/${notebookId}`);

                if (!res.ok) {
                    throw new Error('Erro ao carregar notebook');
                }

                const result: TypeCurrentNotebook[] = await res.json();
                setCurrentNotebook(result);
                console.log("Notebook atual: ", result);
                setFetchLoaded(true);
            } catch(err) {
                console.error(err);
                alert("Erro ao carregar o notebook!");
            }
        };

        if (notebookId) {
            fetchCurrentNotebook();
        }
    }, [notebookId]);

    async function handleCreateMatter(matterName: string) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matter`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: matterName,
                    idNotebook: notebookId
                })
            });

            if (!res.ok) {
                throw new Error('Erro ao criar matéria');
            }

            // Força o MainDeck a atualizar a lista de matérias
            setRefreshTrigger(prev => prev + 1);
            
            console.log("Matéria criada com sucesso!");
        } catch(err) {
            console.error(err);
            throw err; // Propaga o erro para o modal tratar
        }
    }

    return (
        <>
            <div className={styles.content}>
                <div className={styles.leftSide}>
                    <SideBar />
                </div>
                <div className={styles.centerSide}>
                    <h2>
                        {fetchLoaded ? currentNotebook[0].name : "undefined"}
                    </h2>
                    <MainDeck notebookId={notebookId} refreshTrigger={refreshTrigger} />
                    <button 
                        className={styles.btnCreate}
                        onClick={() => setShowCreateMatterModal(true)}
                    >
                        Criar matéria
                    </button>
                </div>
                <div className={styles.RigthSide}>
                    <button>Sinalizando</button>
                </div>
            </div>

            {/* Modal de Criar Matéria */}
            <CreateMatterModal 
                showModal={showCreateMatterModal}
                onClose={() => setShowCreateMatterModal(false)}
                onConfirm={handleCreateMatter}
            />
        </>
    );
}

export default function PageContentProtected() {
    return (
        <ProtectedRoute>
            <PageContent />
        </ProtectedRoute>
    )
}