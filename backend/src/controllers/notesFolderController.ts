import type { Request, Response } from "express";
import NoteFolder from "../models/notesFolderModel.js";

const noteFolderController = {
    createFolder: async (req: Request, res: Response) => {
        const idUser = req.user?.id;
        const { name, parentFolder } = req.body;

        if (!name || typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({ message: "Nome é obrigatório" });
        }

        const result = await NoteFolder.createFolder(name.trim(), idUser!, parentFolder ?? null);

        if ("error" in result) return res.status(500).json({ message: result.error });

        return res.status(201).json({ id: result.id, message: "Folder created" });
    },

    rootFolders: async (req: Request, res: Response) => {
        const idUser = req.user?.id;

        const result = await NoteFolder.rootFoldersByUser(idUser);

        if ("error" in result) return res.status(500).json({ message: result.error });

        return res.status(200).json(result.folders);
    },

    subFolders: async (req: Request, res: Response) => {
        const idUser = req.user?.id;
        const { idParent } = req.params;

        const result = await NoteFolder.subFoldersByParent(Number(idParent), idUser);

        if ("error" in result) return res.status(500).json({ message: result.error });

        return res.status(200).json(result.folders);
    },

    allFolders: async (req: Request, res: Response) => {
        const idUser = req.user?.id;

        const result = await NoteFolder.allFoldersByUser(idUser);

        if ("error" in result) return res.status(500).json({ message: result.error });

        return res.status(200).json(result.folders);
    },

    updateFolder: async (req: Request, res: Response) => {
        const idUser = req.user?.id;
        const { idFolder } = req.params;
        const { name } = req.body;

        if (!name || typeof name !== "string" || name.trim() === "") {
            return res.status(400).json({ message: "Nome é obrigatório" });
        }

        const result = await NoteFolder.updateFolder(Number(idFolder), name.trim(), idUser);

        if (result !== true) {
            const status = result.notFound ? 404 : 500;
            return res.status(status).json({ message: result.error });
        }

        return res.status(200).json({ message: "Updated successfully" });
    },

    deleteFolder: async (req: Request, res: Response) => {
        const idUser = req.user?.id;
        const { idFolder } = req.params;

        const result = await NoteFolder.deleteFolder(Number(idFolder), idUser);

        if (result !== true) return res.status(500).json({ message: result.error });

        return res.status(200).json({ message: "Folder and all its contents deleted" });
    }
};

export default noteFolderController;