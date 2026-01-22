"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import MainDeck from "../../Components/MainDeck/MainDeck";
import ProtectedRoute from "../../Components/ProtectedRoute";
import SideBar from "../../Components/SideBar/SideBar";
import styles from "./style.module.css";
import { getToken } from "../../signin/auth";
import "./style.module.css";

function PageContent() {
    const [currentNotebook, setCurrentNotebook] = useState(null);
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
                    <button className={styles.btnCreate}>Criar matéria</button>
                </div>
                <div className={styles.RigthSide}>
                    <button>Sinalizando</button>
                </div>
            </div>            
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