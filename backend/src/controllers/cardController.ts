import type { Request, Response } from "express";
import { Card, type StatusCard } from "../models/cardModel.js";

const cardsController = {
    createCard: async (req: Request, res: Response) => {
        const { front, back, parentId, subMatterId } = req.body;
        const statusDefault: StatusCard = "new";

        const result = await Card.createCard(front, back, parentId, subMatterId, statusDefault);
        if (result !== true) return res.status(500).json({ message: result.error });

        return res.status(201).json({ message: "Created"});
    },
    cardsByMatter: async (req: Request, res: Response) => {
        const { idMatter } = req.params;

        const result = await Card.cardsByMatter(idMatter);

        if (result.error) return res.status(500).json({ message: result.error });

        return res.status(200).json(result.cards);
    },
    cardsBySubMatter: async (req: Request, res: Response) => {
        const { idSubMatter } = req.params;

        const result = await Card.cardsBySubMatter(idSubMatter);

        if (result.error) return res.status(500).json({ message: result.error });

        return res.status(200).json(result.cards);
    },
    getAllCardsForReview: async (req: Request, res: Response) => {
        const { idMatter } = req.params;
        const { includeSubmatters } = req.query;
        
        const includeSubmattersFlag = includeSubmatters === 'true';

        const result = await Card.getAllCardsForReview(idMatter, includeSubmattersFlag);

        if (result.error) return res.status(500).json({ message: result.error });

        return res.status(200).json(result.cards);
    },
    updateCardStatus: async (req: Request, res: Response) => {
        const { idCard, status, difficulty } = req.body;

        // Calcular próxima data de revisão baseado na dificuldade
        let nextReviewDate = new Date();
        
        if (difficulty === 'easy') {
            // Fácil: 1 semana
            nextReviewDate.setDate(nextReviewDate.getDate() + 7);
        } else if (difficulty === 'medium') {
            // Médio: 3 dias
            nextReviewDate.setDate(nextReviewDate.getDate() + 3);
        } else if (difficulty === 'hard') {
            // Difícil: 5 minutos
            nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 5);
        }

        const result = await Card.updateCardStatus(idCard, status, nextReviewDate);

        if (result !== true) return res.status(500).json({ message: result.error });

        return res.status(200).json({ message: "Status updated" });
    },
    countCardsByMatter: async (req: Request, res: Response) => {
        const { idMatter } = req.params;

        const result = await Card.countCardsByMatter(idMatter);

        if (result.error) return res.status(500).json({ message: result.error });

        return res.status(200).json(result);
    },
    countCardsBySubMatter: async (req: Request, res: Response) => {
        const { idSubMatter } = req.params;

        const result = await Card.countCardsBySubMatter(idSubMatter);

        if (result.error) return res.status(500).json({ message: result.error });

        return res.status(200).json(result);
    },
    updateCard: async (req: Request, res: Response) => {
        const { front, back, idCard } = req.body;

        const result = await Card.updateCard(front, back, idCard);
        if (result !== true) return res.status(500).json({ message: result.error});

        return res.status(200).json({ message: "Updated!"});
    },
    deleteCard: async (req: Request, res: Response) => {
        const { idCard } = req.body;

        const result = await Card.deleteCard(idCard);
        if (result.error) return res.status(500).json({ message: result.error });

        if (result.message)  return res.status(404).json({ message: result.message });

        return res.status(200).json({ message: result.success });
    }
}

export default cardsController;