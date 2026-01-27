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

function PageContent() {
    const [currentNotebook, setCurrentNotebook] = useState(null);
    const [showCreateMatterModal, setShowCreateMatterModal] = useState(false);
    const [matters, setMatters] = useState([]);
    const params = useParams();
    const router = useRouter();
    
    // Pega o ID do notebook da URL
    const notebookId = params.id;

    // Busca o notebook específico quando o ID muda
    useEffect(() => {
        const fetchCurrentNotebook = async () => {

            try {
                const token = getToken();
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/notebook/${notebookId}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    }
                );

                if (!res.ok) {
                    throw new Error('Erro ao carregar notebook');
                }

                const result = await res.json();
                setCurrentNotebook(result);
                console.log("Notebook atual: ", result);
            } catch(err) {
                console.error(err);
                alert("Erro ao carregar o notebook!");
            }
        };

        fetchCurrentNotebook();
    }, [notebookId]);

    // Buscar matérias do notebook
    useEffect(() => {
        const fetchMatters = async () => {
            try {
                const token = getToken();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matter/notebook`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        idNotebook: notebookId
                    })
                });

                if (!res.ok) {
                    throw new Error('Erro ao carregar matérias');
                }

                const result = await res.json();
                setMatters(result);
            } catch(err) {
                console.error(err);
            }
        };

        if (notebookId) {
            fetchMatters();
        }
    }, [notebookId]);

    async function updateNameNotebook(newName: string) {

        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notebook`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    "idNotebook": 5,
                    "newName": newName
                })
            });

            if (!res.ok) {
                throw new Error('Erro ao atualizar nome');
            }

            // Atualiza o estado loca
            console.log("Nome atualizado!");
        } catch(err) {
            console.log("Error: " + err);
            alert("Erro ao atualizar nome!");
        }
    }

    async function handleCreateMatter(matterName: string) {
        try {
            const token = getToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matter`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: matterName,
                    idNotebook: notebookId
                })
            });

            if (!res.ok) {
                throw new Error('Erro ao criar matéria');
            }

            const newMatter = await res.json();
            
            // Atualizar a lista de matérias
            setMatters(prev => [...prev, newMatter]);
            
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
                        
                    </h2>
                    <MainDeck notebookId={notebookId} />
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