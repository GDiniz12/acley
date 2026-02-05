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