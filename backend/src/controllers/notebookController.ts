import type { Request, Response } from "express";
import Notebook from "../models/notebookModel.js";

const notebookController = {
    createNotebook: async (req: Request, res: Response) => {
        const { nameNotebook, idUser } = req.body;

        const notebook = await Notebook.createNotebook(nameNotebook, idUser);

        if (notebook !== true) {
            return res.status(500).json({ error: notebook.error});
        }
        return res.status(201).json("Notebook was created!");
    },
    notebooksByUser: async (req: Request, res: Response) => {
        const { idUser } = req.params;

        let id = 0;

        if (typeof idUser === 'string') id = parseInt(idUser);
        const notebooks = await Notebook.notebooksByUser(id);

        if (notebooks.error) {
            return res.status(500).json({ error: notebooks.error });
        }
        return res.status(200).json({ notebooks });
    },
    updateNotebook: async (req: Request, res: Response) => {
        const { idNotebook, newName } = req.body;

        const result = await Notebook.updateNameNotebook(idNotebook, newName);

        if (result !== true) return res.status(500).json({ error: result.error });

        return res.status(200).json({ message: "Updated successfuly"});
    },
    deleteNotebook: async (req: Request, res: Response) => {
        const { idNotebook } = req.body;

        const result = await Notebook.deleteNotebook(idNotebook);

        if (result !== true) return res.status(500).json({ message: result.error });

        return res.status(200).json({ message: "Deleted Notebook"});
    }
}

export default notebookController;