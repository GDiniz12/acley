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
    }
}

export default usersController;