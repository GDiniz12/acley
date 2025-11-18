import type { Request, Response } from "express";
import Notebook from "../models/notebookModel.js";

const notebookController = {
    createNotebook: async (req: Request, res: Response) => {
        const { nameNotebook, idUser } = req.body;

        const notebook = await Notebook.createNotebook(nameNotebook, idUser);

        if (!notebook) {
            return res.status(500).json({ error: notebook.error});
        }
        return res.status(201).json("Notebook was created!");
    }
}