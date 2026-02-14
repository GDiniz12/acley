'use client'

import { useState, useEffect } from "react";
import styles from "./Reviewmodal.module.css";

interface Card {
    id: string;
    front: string;
    back: string;
    status_card: string;
}

interface ReviewModalProps {
    showModal: boolean;
    onClose: () => void;
    matterId: number;
    matterName: string;
    isSubMatter?: boolean;
    onReviewComplete: () => void;
}

export default function ReviewModal({ 
    showModal, 
    onClose, 
    matterId, 
    matterName,
    isSubMatter = false,
    onReviewComplete
}: ReviewModalProps) {
    const [cards, setCards] = useState<Card[]>([]);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (showModal) {
            fetchCards();
        }
    }, [showModal, matterId, isSubMatter]);

    async function fetchCards() {
        setIsLoading(true);
        try {
            let res;
            
            if (isSubMatter) {
                // Se é submatéria, buscar apenas os cards desta submatéria
                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/card/submatter/${matterId}`);
            } else {
                // Se é matéria pai, buscar todos os cards (incluindo de submatérias)
                res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/card/review/${matterId}?includeSubmatters=true`);
            }

            if (!res.ok) {
                throw new Error('Erro ao carregar cards');
            }

            const data = await res.json();
            
            // Filtrar apenas cards que estão disponíveis para revisão
            // (cards com next_review NULL ou next_review <= agora)
            const availableCards = (data || []).filter((card: Card) => {
                // Como o backend já filtra por next_review, mantemos todos os cards retornados
                return true;
            });
            
            setCards(availableCards);
            setCurrentCardIndex(0);
            setShowAnswer(false);
        } catch(err) {
            console.error("Erro ao buscar cards:", err);
            alert("Erro ao carregar flashcards!");
            setCards([]);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDifficulty(difficulty: 'easy' | 'medium' | 'hard') {
        if (!currentCard || isSubmitting) return;

        setIsSubmitting(true);

        try {
            // Determinar novo status baseado na dificuldade
            let newStatus: 'new' | 'learn' | 'review';
            
            if (difficulty === 'hard') {
                newStatus = 'learn';
            } else {
                // easy ou medium vão para review
                newStatus = 'review';
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/card/status`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idCard: currentCard.id,
                    status: newStatus,
                    difficulty: difficulty
                })
            });

            if (!res.ok) {
                const errorData = await res.json();
                console.error("Erro do servidor:", errorData);
                throw new Error('Erro ao atualizar status do card');
            }

            // Remover o card atual da lista (já foi revisado e agendado)
            const updatedCards = cards.filter((_, index) => index !== currentCardIndex);
            setCards(updatedCards);

            // Se ainda há cards, continuar na mesma posição (que agora tem o próximo card)
            // Se não há mais cards, finalizar
            if (updatedCards.length === 0) {
                // Não mostrar alert, apenas fechar e atualizar
                onReviewComplete();
                handleClose();
            } else {
                // Se o índice atual está fora dos limites, voltar para o último
                if (currentCardIndex >= updatedCards.length) {
                    setCurrentCardIndex(updatedCards.length - 1);
                }
                setShowAnswer(false);
            }
        } catch(err) {
            console.error("Erro ao atualizar card:", err);
            alert("Erro ao processar resposta! Verifique o console para mais detalhes.");
        } finally {
            setIsSubmitting(false);
        }
    }

    function handleShowAnswer() {
        setShowAnswer(true);
    }

    function handleClose() {
        // Atualizar contagens antes de fechar
        onReviewComplete();
        
        setCards([]);
        setCurrentCardIndex(0);
        setShowAnswer(false);
        setIsLoading(true);
        onClose();
    }

    if (!showModal) return null;

    const currentCard = cards[currentCardIndex];
    const progress = cards.length > 0 ? ((currentCardIndex + 1) / cards.length) * 100 : 0;

    return (
        <div className={styles.modalOverlay} onClick={handleClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={handleClose}>
                    ✕
                </button>

                <div className={styles.header}>
                    <h2>{matterName} {isSubMatter && <span style={{fontSize: '0.8em', color: '#888'}}>(Submatéria)</span>}</h2>
                    <div className={styles.progressBar}>
                        <div 
                            className={styles.progressFill} 
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <p className={styles.progressText}>
                        {cards.length > 0 ? `${currentCardIndex + 1} de ${cards.length}` : '0 de 0'}
                    </p>
                </div>

                {isLoading ? (
                    <div className={styles.loading}>Carregando flashcards...</div>
                ) : cards.length === 0 ? (
                    <div className={styles.noCards}>
                        <p>Nenhum flashcard disponível para revisão!</p>
                        <button onClick={handleClose} className={styles.backButton}>
                            Voltar
                        </button>
                    </div>
                ) : currentCard ? (
                    <div className={styles.cardContainer}>
                        <div className={styles.card}>
                            <div className={styles.cardSide}>
                                <h3 className={styles.sideLabel}>
                                    {showAnswer ? 'Resposta' : 'Pergunta'}
                                </h3>
                                <div className={styles.cardContent}>
                                    {showAnswer ? currentCard.back : currentCard.front}
                                </div>
                            </div>

                            {!showAnswer ? (
                                <button 
                                    className={styles.showAnswerButton}
                                    onClick={handleShowAnswer}
                                >
                                    Ver Resposta
                                </button>
                            ) : (
                                <div className={styles.difficultyButtons}>
                                    <button 
                                        className={`${styles.difficultyButton} ${styles.easy}`}
                                        onClick={() => handleDifficulty('easy')}
                                        disabled={isSubmitting}
                                    >
                                        <span className={styles.buttonLabel}>Fácil</span>
                                        <span className={styles.buttonTime}>7 dias</span>
                                    </button>
                                    <button 
                                        className={`${styles.difficultyButton} ${styles.medium}`}
                                        onClick={() => handleDifficulty('medium')}
                                        disabled={isSubmitting}
                                    >
                                        <span className={styles.buttonLabel}>Médio</span>
                                        <span className={styles.buttonTime}>3 dias</span>
                                    </button>
                                    <button 
                                        className={`${styles.difficultyButton} ${styles.hard}`}
                                        onClick={() => handleDifficulty('hard')}
                                        disabled={isSubmitting}
                                    >
                                        <span className={styles.buttonLabel}>Difícil</span>
                                        <span className={styles.buttonTime}>5 minutos</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className={styles.statusBadge}>
                            <span className={styles[`status-${currentCard.status_card}`]}>
                                {currentCard.status_card === 'new' && 'Novo'}
                                {currentCard.status_card === 'learn' && 'Aprendendo'}
                                {currentCard.status_card === 'review' && 'Revisão'}
                            </span>
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    );
}