'use client'

import { useState, useEffect } from "react";
import styles from "./style.module.css";
import MatterCard from "../MatterCard/MatterCard";
import ReviewModal from "../ReviewModal/ReviewModal";

interface Matter {
    id: number;
    name: string;
}

interface CardCounts {
    new: number;
    learn: number;
    review: number;
}

interface MainDeckProps {
    notebookId: string;
    refreshTrigger?: number;
}

export default function MainDeck({ notebookId, refreshTrigger }: MainDeckProps) {
    const [matters, setMatters] = useState<Matter[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [mattersWithSubMatters, setMattersWithSubMatters] = useState<Set<number>>(new Set());
    const [cardCounts, setCardCounts] = useState<Map<number, CardCounts>>(new Map());

    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedMatterForReview, setSelectedMatterForReview] = useState<{
        id: number;
        name: string;
        isSubMatter: boolean;
    } | null>(null);

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
                if (!res.ok) throw new Error('Erro ao carregar matérias');
                const data = await res.json();
                setMatters(data || []);
                await checkMattersWithSubMatters(data || []);
                await fetchCardCounts(data || []);
            } catch (err) {
                console.error("Erro ao buscar matérias:", err);
                setMatters([]);
            } finally {
                setIsLoading(false);
            }
        }
        fetchMatters();
    }, [notebookId, refreshTrigger]);

    async function fetchCardCounts(matters: Matter[]) {
        const countsMap = new Map<number, CardCounts>();
        for (const matter of matters) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/card/count/matter/${matter.id}`);
                if (res.ok) countsMap.set(matter.id, await res.json());
            } catch { countsMap.set(matter.id, { new: 0, learn: 0, review: 0 }); }
        }
        setCardCounts(countsMap);
    }

    async function checkMattersWithSubMatters(matters: Matter[]) {
        const mattersWithSubs = new Set<number>();
        for (const matter of matters) {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/submatter/parent/${matter.id}`);
                if (res.ok) {
                    const subMatters = await res.json();
                    if (subMatters?.length > 0) mattersWithSubs.add(matter.id);
                }
            } catch { /* ignore */ }
        }
        setMattersWithSubMatters(mattersWithSubs);
    }

    function handleOpenReview(matterId: number, matterName: string, isSubMatter: boolean = false) {
        setSelectedMatterForReview({ id: matterId, name: matterName, isSubMatter });
        setShowReviewModal(true);
    }

    function handleCloseReview() {
        setShowReviewModal(false);
        setSelectedMatterForReview(null);
    }

    function handleReviewComplete() { fetchCardCounts(matters); }
    function handleSubMatterUpdate() { checkMattersWithSubMatters(matters); }
    function handleCardUpdate() { fetchCardCounts(matters); }

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

    async function handleRenameMatter() {
        if (!selectedMatter || !newName.trim()) { alert("Nome inválido!"); return; }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matter`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idMatter: selectedMatter.id, NewName: newName.trim() }),
            });
            if (!res.ok) throw new Error();
            setMatters(prev => prev.map(m => m.id === selectedMatter.id ? { ...m, name: newName.trim() } : m));
            handleCloseModal();
        } catch { alert("Erro ao renomear matéria!"); }
    }

    async function handleDeleteMatter() {
        if (!selectedMatter) return;
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/matter`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idMatter: selectedMatter.id }),
            });
            if (!res.ok) throw new Error();
            setMatters(prev => prev.filter(m => m.id !== selectedMatter.id));
            setMattersWithSubMatters(prev => { const s = new Set(prev); s.delete(selectedMatter.id); return s; });
            setCardCounts(prev => { const m = new Map(prev); m.delete(selectedMatter.id); return m; });
            handleCloseModal();
        } catch { alert("Erro ao excluir matéria!"); }
    }

    return (
        <>
            <div className={styles.container}>
                {/* Header */}
                <div className={styles.top}>
                    <span><h4>Matérias</h4></span>
                    <span className={styles.status}>
                        <h5>Novo</h5>
                        <h5>Aprender</h5>
                        <h5>Revisar</h5>
                    </span>
                </div>

                {/* List */}
                <div className={styles.mattersContent}>
                    {isLoading ? (
                        <div className={styles.loadingMessage}>Carregando matérias…</div>
                    ) : matters.length === 0 ? (
                        <div className={styles.emptyMessage}>
                            Nenhuma matéria ainda. Clique em &quot;+ Matéria&quot; para começar.
                        </div>
                    ) : (
                        matters.map((matter) => {
                            const counts = cardCounts.get(matter.id) || { new: 0, learn: 0, review: 0 };
                            return (
                                <MatterCard
                                    key={matter.id}
                                    id={matter.id}
                                    name={matter.name}
                                    newCards={counts.new}
                                    learningCards={counts.learn}
                                    reviewCards={counts.review}
                                    onRename={() => handleOpenRenameModal(matter)}
                                    onDelete={() => handleOpenDeleteModal(matter)}
                                    hasSubMatters={mattersWithSubMatters.has(matter.id)}
                                    onSubMatterUpdate={handleSubMatterUpdate}
                                    onCardUpdate={handleCardUpdate}
                                    onOpenReview={handleOpenReview}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            {/* Review modal */}
            {showReviewModal && selectedMatterForReview && (
                <ReviewModal
                    showModal={showReviewModal}
                    onClose={handleCloseReview}
                    matterId={selectedMatterForReview.id}
                    matterName={selectedMatterForReview.name}
                    isSubMatter={selectedMatterForReview.isSubMatter}
                    onReviewComplete={handleReviewComplete}
                />
            )}

            {/* Rename / Delete matter modal */}
            {showModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    backgroundColor: 'rgba(10,10,20,0.28)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
                    zIndex: 1000, display: 'flex', justifyContent: 'center', alignItems: 'center',
                    padding: '1rem',
                }} onClick={handleCloseModal}>
                    <div style={{
                        background: 'var(--glass-bg-strong)', backdropFilter: 'var(--glass-blur-strong)', WebkitBackdropFilter: 'var(--glass-blur-strong)',
                        padding: '2rem', borderRadius: '20px',
                        width: '420px', maxWidth: '100%',
                        border: '1px solid var(--glass-border)',
                        boxShadow: 'var(--glass-shadow-lg), var(--glass-highlight)',
                    }} onClick={e => e.stopPropagation()}>
                        {modalType === 'rename' ? (
                            <>
                                <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Renomear matéria</h2>
                                <p style={{ marginBottom: '1.25rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Digite o novo nome</p>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={e => setNewName(e.target.value)}
                                    placeholder="Nome da matéria"
                                    autoFocus
                                    style={{
                                        width: '100%', padding: '0.7rem 0.85rem', borderRadius: '8px',
                                        border: '1px solid var(--glass-border-soft)', backgroundColor: 'rgba(255,255,255,0.6)',
                                        color: 'var(--text-primary)', fontSize: '0.9rem', outline: 'none',
                                        boxSizing: 'border-box', fontFamily: 'inherit',
                                    }}
                                />
                                <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                                    <button onClick={handleRenameMatter} style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', border: '1px solid var(--accent)', backgroundColor: 'var(--accent)', color: 'var(--on-accent)', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        Confirmar
                                    </button>
                                    <button onClick={handleCloseModal} style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', border: '1px solid var(--glass-border-soft)', backgroundColor: 'rgba(255,255,255,0.6)', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <h2 style={{ marginBottom: '0.5rem', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Excluir matéria</h2>
                                <p style={{ marginBottom: '0.5rem', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                                    Tem certeza que deseja excluir <strong style={{ color: 'var(--text-secondary)' }}>&quot;{selectedMatter?.name}&quot;</strong>?
                                </p>
                                <p style={{ color: 'var(--danger)', fontSize: '0.8rem', marginBottom: '1.5rem' }}>
                                    Todas as submatérias serão excluídas. Essa ação não pode ser desfeita.
                                </p>
                                <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'flex-end' }}>
                                    <button onClick={handleDeleteMatter} style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', border: '1px solid var(--danger)', backgroundColor: 'var(--danger)', color: '#fff', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
                                        Excluir
                                    </button>
                                    <button onClick={handleCloseModal} style={{ padding: '0.55rem 1.25rem', borderRadius: '10px', border: '1px solid var(--glass-border-soft)', backgroundColor: 'rgba(255,255,255,0.6)', color: 'var(--text-secondary)', fontSize: '0.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
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