"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import MainDeck from "../../Components/MainDeck/MainDeck";
import ProtectedRoute from "../../Components/ProtectedRoute";
import SideBar from "../../Components/SideBar/SideBar";
import CreateMatterModal from "../../Components/CreateMatterModal/CreateMatter";
import CreateSubMatterModal from "../../Components/CreateSubMatter/Createsubmatter";
import CreateCardModal from "../../Components/CreateCardModal/Createcardmodal";
import styles from "./style.module.css";
import "./style.module.css";

interface TypeCurrentNotebook {
    name: string;
}

function PageContent() {
    const [currentNotebook, setCurrentNotebook] = useState<TypeCurrentNotebook[]>([]);
    const [fetchLoaded, setFetchLoaded] = useState(false);
    const [showCreateMatterModal, setShowCreateMatterModal] = useState(false);
    const [showCreateSubMatterModal, setShowCreateSubMatterModal] = useState(false);
    const [showCreateCardModal, setShowCreateCardModal] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const params = useParams();
    
    const notebookId = params.id as string;

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

            setRefreshTrigger(prev => prev + 1);
            
            console.log("Matéria criada com sucesso!");
        } catch(err) {
            console.error(err);
            throw err;
        }
    }

    async function handleCreateSubMatter(subMatterName: string, parentMatterId: number) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submatter`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: subMatterName,
                    matterParent: parentMatterId.toString()
                })
            });

            if (!res.ok) {
                throw new Error('Erro ao criar submatéria');
            }

            setRefreshTrigger(prev => prev + 1);
            
            console.log("Submatéria criada com sucesso!");
        } catch(err) {
            console.error(err);
            throw err;
        }
    }

    async function handleCreateCard(front: string, back: string, matterId: number, submatterId: number | null) {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/card`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    front: front,
                    back: back,
                    parentId: matterId.toString(),
                    subMatterId: submatterId ? submatterId.toString() : null
                })
            });

            if (!res.ok) {
                throw new Error('Erro ao criar flashcard');
            }

            setRefreshTrigger(prev => prev + 1);
            
            console.log("Flashcard criado com sucesso!");
        } catch(err) {
            console.error(err);
            throw err;
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
                    <div className={styles.buttonContainer}>
                        <button 
                            className={styles.btnCreate}
                            onClick={() => setShowCreateMatterModal(true)}
                        >
                            Criar matéria
                        </button>
                        <button 
                            className={styles.btnCreateSub}
                            onClick={() => setShowCreateSubMatterModal(true)}
                        >
                            Criar submatéria
                        </button>
                        <button 
                            className={styles.btnCreateCard}
                            onClick={() => setShowCreateCardModal(true)}
                        >
                            Criar flashcard
                        </button>
                    </div>
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

            {/* Modal de Criar Submatéria */}
            <CreateSubMatterModal 
                showModal={showCreateSubMatterModal}
                onClose={() => setShowCreateSubMatterModal(false)}
                onConfirm={handleCreateSubMatter}
                notebookId={notebookId}
            />

            {/* Modal de Criar Flashcard */}
            <CreateCardModal 
                showModal={showCreateCardModal}
                onClose={() => setShowCreateCardModal(false)}
                onConfirm={handleCreateCard}
                notebookId={notebookId}
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