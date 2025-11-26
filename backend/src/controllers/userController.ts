import type { Request, Response } from "express";
import User from "../models/userModel.js";

const usersController = {
    createUser: async (req: Request, res: Response) => {
        const { username, email, password } = req.body;

        const user = await User.createUser(username, email, password);

        if (!user) {
            return res.status(500).json({ message: "Database error"})
        }
        return res.status(201).json({ message: "User created successfully"})
    },
    allUsers: async (req: Request, res: Response) => {
        const result = await User.allUsers();

        if (result.users) {
            return res.status(200).json(result.users);
        }
        return res.status(500).json(result.error)
    },
    userById: async (req: Request, res: Response) => {
        const { idParam } = req.params;

        let id = 0;

        if (typeof idParam === 'string') id = parseInt(idParam);

        const result = await User.userByID(id);

        if (result === false) return res.status(404).json({ message: "User not found"});

        if (result.user) return res.status(200).json(result.user);

        return res.status(500).json({ message: "Database error", error: result.error});
    },
    updateUser: async (req: Request, res: Response) => {
        const { username, email, password, idUser } = req.body;

        const result = await User.updateUser(username, email, password, idUser);
        if (result.error) {
            return res.status(500).json({ error: result.error });
        }
        return res.status(200).json({ message: result.message });
    },
    deleteUser: async (req: Request, res: Response) => {
        const { idUser } = req.body;

        const result = await User.deleteUser(idUser);

        if (result !== true) res.status(500).json({ message: result.error });

        return res.status(200).json({ message: "Deleted user"});
    }
}

export default usersController;