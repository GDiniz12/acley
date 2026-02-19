import type { Request, Response } from "express";
import Notebook from "../models/notebookModel.js";

const notebookController = {
    createNotebook: async (req: Request, res: Response) => {
        const { nameNotebook, idUser } = req.body;

        const result = await Notebook.createNotebook(nameNotebook, idUser);

        if ('error' in result) {
            return res.status(500).json({ error: result });
        }
        return res.status(201).json(result.notebook);
    },
    notebookById: async (req: Request, res: Response) => {
        const { id } = req.params;

        const result = await Notebook.notebooksById(id);

        if ('err' in result) {
            return res.status(500).json({ message: result.err });
        }

        return res.status(200).json(result.notebooks);
    },
    notebooksByUser: async (req: Request, res: Response) => {
        const idUser = req.user && req.user.id;

        const notebooks = await Notebook.notebooksByUser(idUser);

        if (!Array.isArray(notebooks)) {
            return res.status(500).json({ error: notebooks });
        }
        return res.status(200).json(notebooks);
    },
    updateNotebook: async (req: Request, res: Response) => {
        const { id } = req.params;
        const { newName } = req.body;

        if (!newName || typeof newName !== "string" || newName.trim() === "") {
            return res.status(400).json({ error: "Nome é obrigatório" });
        }

        const result = await Notebook.updateNameNotebook(id, newName.trim());

        if (result !== true) {
            const status = result.notFound ? 404 : 500;
            return res.status(status).json({ error: result.error });
        }

        return res.status(200).json({ message: "Updated successfully" });
    },
    deleteNotebook: async (req: Request, res: Response) => {
        const { idNotebook } = req.params;

        const result = await Notebook.deleteNotebook(idNotebook);

        if (result !== true) return res.status(500).json({ message: result.error });

        return res.status(200).json({ message: "Deleted Notebook"});
    }
}

export default notebookController;