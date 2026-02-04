import type { Request, Response } from "express";
import SubMatter from "../models/subMatterModel.js";

const subMatterController = {
    createSubMatter: async (req: Request, res: Response) => {
        const { name, matterParent } = req.body;

        const result = await SubMatter.createSubMatter(name, matterParent);

        if (result !== true) return res.status(500).json({ message: result.error });

        return res.status(201).json({ message: "Created submatter" });
    },

    subMattersByParent: async (req: Request, res: Response) => {
        const { idParent } = req.params;

        const result = await SubMatter.subMattersByParent(idParent);

        if (result.message) return res.status(404).json({ message: result.message });
        if (result.error) return res.status(500).json({ message: result.error });

        return res.status(200).json(result.subMatters);
    },

    updateSubMatter: async (req: Request, res: Response) => {
        const { newName, idSubMatter } = req.body;

        const result = await SubMatter.updateNameSubmatter(newName, idSubMatter);

        if (result !== true) return res.status(500).json({ message: result.error });

        return res.status(200).json({ message: "Updated successfully" });
    },

    deleteSubMatter: async (req: Request, res: Response) => {
        const { idSubMatter } = req.body;

        const result = await SubMatter.deleteSubMatter(idSubMatter);

        if (result !== true) return res.status(500).json({ message: result.error });

        return res.status(200).json({ message: "Deleted successfully" });
    }
}

export default subMatterController;