"use client";

import { useState, useEffect } from "react";
import MainDeck from "../../Components/MainDeck/MainDeck";
import ProtectedRoute from "../../Components/ProtectedRoute";
import CreateMatterModal from "../../Components/CreateMatterModal/CreateMatter";
import CreateSubMatterModal from "../../Components/CreateSubMatter/Createsubmatter";
import CreateCardModal from "../../Components/CreateCardModal/Createcardmodal";
import { useNotebookContext } from "../NotebookContext";
import styles from "./style.module.css";

interface TypeCurrentNotebook {
    name: string;
}

function PageContent() {
    const { selectedNotebookId } = useNotebookContext();

    const [currentNotebook, setCurrentNotebook] = useState<TypeCurrentNotebook[]>([]);
    const [fetchLoaded, setFetchLoaded] = useState(false);
    const [showCreateMatterModal, setShowCreateMatterModal] = useState(false);
    const [showCreateSubMatterModal, setShowCreateSubMatterModal] = useState(false);
    const [showCreateCardModal, setShowCreateCardModal] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    useEffect(() => {
        if (!selectedNotebookId) {
            setCurrentNotebook([]);
            setFetchLoaded(false);
            return;
        }

        const fetchCurrentNotebook = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notebook/${selectedNotebookId}`);
                if (!res.ok) throw new Error("Erro ao carregar notebook");
                const result: TypeCurrentNotebook[] = await res.json();
                setCurrentNotebook(result);
                setFetchLoaded(true);
            } catch (err) {
                console.error(err);
                alert("Erro ao carregar o notebook!");
            }
        };

        fetchCurrentNotebook();
    }, [selectedNotebookId]);

    async function handleCreateMatter(matterName: string) {
        if (!selectedNotebookId) return;
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matter`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: matterName, idNotebook: selectedNotebookId }),
        });
        if (!res.ok) throw new Error("Erro ao criar matéria");
        setRefreshTrigger((p) => p + 1);
    }

    async function handleCreateSubMatter(subMatterName: string, parentMatterId: number) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submatter`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: subMatterName, matterParent: parentMatterId.toString() }),
        });
        if (!res.ok) throw new Error("Erro ao criar submatéria");
        setRefreshTrigger((p) => p + 1);
    }

    async function handleCreateCard(front: string, back: string, matterId: number, submatterId: number | null) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/card`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                front,
                back,
                parentId: matterId.toString(),
                subMatterId: submatterId ? submatterId.toString() : null,
            }),
        });
        if (!res.ok) throw new Error("Erro ao criar flashcard");
        setRefreshTrigger((p) => p + 1);
    }

    const today = new Date().toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric",
    });

    // No notebook selected yet
    if (!selectedNotebookId) {
        return (
            <div className={styles.page}>
                <div className={styles.emptyState}>
                    <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6h4"/><path d="M2 10h4"/><path d="M2 14h4"/><path d="M2 18h4"/>
                        <rect width="16" height="20" x="4" y="2" rx="2"/>
                    </svg>
                    <p className={styles.emptyTitle}>Nenhum notebook selecionado</p>
                    <p className={styles.emptySub}>Selecione ou crie um notebook na barra lateral.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            {/* ── Toolbar ── */}
            <div className={styles.toolbar}>
                <div className={styles.toolbarLeft}>
                    <h1 className={styles.notebookTitle}>
                        {fetchLoaded ? currentNotebook[0]?.name : "…"}
                    </h1>
                    <span className={styles.toolbarMeta}>{today}</span>
                </div>

                <div className={styles.toolbarRight}>
                    <button
                        className={styles.btnCreate}
                        onClick={() => setShowCreateMatterModal(true)}
                    >
                        + Matéria
                    </button>
                    <button
                        className={styles.btnCreateSub}
                        onClick={() => setShowCreateSubMatterModal(true)}
                    >
                        + Submatéria
                    </button>
                    <button
                        className={styles.btnCreateCard}
                        onClick={() => setShowCreateCardModal(true)}
                    >
                        + Flashcard
                    </button>
                </div>
            </div>

            {/* ── Content ── */}
            <div className={styles.content}>
                <MainDeck notebookId={selectedNotebookId} refreshTrigger={refreshTrigger} />
            </div>

            {/* ── Modals ── */}
            <CreateMatterModal
                showModal={showCreateMatterModal}
                onClose={() => setShowCreateMatterModal(false)}
                onConfirm={handleCreateMatter}
            />
            <CreateSubMatterModal
                showModal={showCreateSubMatterModal}
                onClose={() => setShowCreateSubMatterModal(false)}
                onConfirm={handleCreateSubMatter}
                notebookId={selectedNotebookId}
            />
            <CreateCardModal
                showModal={showCreateCardModal}
                onClose={() => setShowCreateCardModal(false)}
                onConfirm={handleCreateCard}
                notebookId={selectedNotebookId}
            />
        </div>
    );
}

export default function CardsPage() {
    return (
        <ProtectedRoute>
            <PageContent />
        </ProtectedRoute>
    );
}