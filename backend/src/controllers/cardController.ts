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

        if ('error' in result) return res.status(500).json({ message: result.error });

        return res.status(200).json(result.cards);
    },
    cardsBySubMatter: async (req: Request, res: Response) => {
        const { idSubMatter } = req.params;

        const result = await Card.cardsBySubMatter(idSubMatter);

        if ('error' in result) return res.status(500).json({ message: result.error });

        return res.status(200).json(result.cards);
    },
    getAllCardsForReview: async (req: Request, res: Response) => {
        const { idMatter } = req.params;
        const { includeSubmatters } = req.query;
        
        const includeSubmattersFlag = includeSubmatters === 'true';

        const result = await Card.getAllCardsForReview(idMatter, includeSubmattersFlag);

        if ('error' in result) return res.status(500).json({ message: result.error });

        return res.status(200).json(result.cards);
    },
    updateCardStatus: async (req: Request, res: Response) => {
        try {
            const { idCard, status, difficulty } = req.body;

            if (!idCard) {
                return res.status(400).json({ message: "idCard é obrigatório" });
            }

            if (!status || !['new', 'learn', 'review'].includes(status)) {
                return res.status(400).json({ message: "status inválido (deve ser: new, learn ou review)" });
            }

            if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
                return res.status(400).json({ message: "difficulty inválida (deve ser: easy, medium ou hard)" });
            }

            const result = await Card.updateCardStatus(idCard, status, difficulty);

            if (result !== true) {
                console.error("Erro ao atualizar status do card:", result.error);
                return res.status(500).json({ message: result.error });
            }

            return res.status(200).json({ message: "Status updated" });
        } catch (error) {
            console.error("Erro não tratado em updateCardStatus:", error);
            return res.status(500).json({ message: "Erro interno do servidor", error: String(error) });
        }
    },
    countCardsByMatter: async (req: Request, res: Response) => {
        const { idMatter } = req.params;

        const result = await Card.countCardsByMatter(idMatter);

        if ('error' in result) return res.status(500).json({ message: result.error });

        return res.status(200).json(result);
    },
    countCardsBySubMatter: async (req: Request, res: Response) => {
        const { idSubMatter } = req.params;

        const result = await Card.countCardsBySubMatter(idSubMatter);

        if ('error' in result) return res.status(500).json({ message: result.error });

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

        if ('error' in result) return res.status(500).json({ message: result.error });
        if ('message' in result) return res.status(404).json({ message: result.message });

        return res.status(200).json({ message: result.success });
    }
}

export default cardsController;