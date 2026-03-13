import type { Request, Response } from "express";
import Note from "../models/noteModel.js";

const noteController = {
    createNote: async (req: Request, res: Response) => {
        const idUser = req.user?.id;
        const { title, content, folderId } = req.body;

        if (!title || typeof title !== "string" || title.trim() === "") {
            return res.status(400).json({ message: "Título é obrigatório" });
        }

        const result = await Note.createNote(title.trim(), idUser!, content ?? null, folderId ?? null);

        if ("error" in result) return res.status(500).json({ message: result.error });

        return res.status(201).json(result.note);
    },

    rootNotes: async (req: Request, res: Response) => {
        const idUser = req.user?.id;

        const result = await Note.rootNotesByUser(idUser);

        if ("error" in result) return res.status(500).json({ message: result.error });

        return res.status(200).json(result.notes);
    },

    notesByFolder: async (req: Request, res: Response) => {
        const idUser = req.user?.id;
        const { idFolder } = req.params;

        const result = await Note.notesByFolder(Number(idFolder), idUser);

        if ("error" in result) return res.status(500).json({ message: result.error });

        return res.status(200).json(result.notes);
    },

    noteById: async (req: Request, res: Response) => {
        const idUser = req.user?.id;
        const { idNote } = req.params;

        const result = await Note.noteById(Number(idNote), idUser);

        if ("error" in result) return res.status(500).json({ message: result.error });
        if ("notFound" in result) return res.status(404).json({ message: "Note not found" });

        return res.status(200).json(result.note);
    },

    allNotes: async (req: Request, res: Response) => {
        const idUser = req.user?.id;

        const result = await Note.allNotesByUser(idUser);

        if ("error" in result) return res.status(500).json({ message: result.error });

        return res.status(200).json(result.notes);
    },

    searchNotes: async (req: Request, res: Response) => {
        const idUser = req.user?.id;
        const { q } = req.query;

        if (!q || typeof q !== "string" || q.trim() === "") {
            return res.status(400).json({ message: "Parâmetro de busca 'q' é obrigatório" });
        }

        const result = await Note.searchNotes(idUser, q.trim());

        if ("error" in result) return res.status(500).json({ message: result.error });

        return res.status(200).json(result.notes);
    },

    updateNote: async (req: Request, res: Response) => {
        const idUser = req.user?.id;
        const { idNote } = req.params;
        const { title, content, folderId } = req.body;

        const result = await Note.updateNote(Number(idNote), idUser, title, content, folderId);

        if (result !== true) {
            const status = result.notFound ? 404 : 500;
            return res.status(status).json({ message: result.error });
        }

        return res.status(200).json({ message: "Updated successfully" });
    },

    deleteNote: async (req: Request, res: Response) => {
        const idUser = req.user?.id;
        const { idNote } = req.params;

        const result = await Note.deleteNote(Number(idNote), idUser);

        if (result !== true) {
            const status = result.notFound ? 404 : 500;
            return res.status(status).json({ message: result.error });
        }

        return res.status(200).json({ message: "Deleted successfully" });
    }
};

export default noteController;