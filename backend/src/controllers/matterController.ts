import type { Response, Request } from "express";
import Matter from "../models/matterModel.js";

const matterController = {
    createMatter: async (req: Request, res: Response) => {
        const { name, idNotebook } = req.body;

        const result = await Matter.createMatter(name, idNotebook);

        if (result !== true) return res.status(500).json({ message: result.error });

        return res.status(201).json({ message: "Created matter"});
    },
    mattersByNotebook: async (req: Request, res: Response) => {
        const { idNotebook } = req.body;

        const result = await Matter.mattersByNotebook(idNotebook);

        if (result.error) return res.status(500).json({ message: result.error });

        return res.status(200).json(result.matters);
    },
    updateMatter: async (req: Request, res: Response) => {
        const { idMatter, NewName } = req.body;

        const result = await Matter.updateMatter(idMatter, NewName);

        if (result !== true) return res.status(500).json({ message: result.error });

        return res.status(200).json({ message: "Updated successfuly"});
    },
    deleteMatter: async (req: Request, res: Response) => {
        const { idMatter } = req.body;

        const result = await Matter.deleteMatter(idMatter);

        if (result !== true) return res.status(500).json({ message: result.error });

        return res.status(200).json({ message: "Deleted successfuly"});
    }
}