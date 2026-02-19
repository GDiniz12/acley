import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;

    if (!authHeader) return res.status(400).json({ message: "You dont have authorization to access this website"});

    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token!, process.env.JWT_SECRET!);

        if (typeof decoded === "string") {
            return res.status(401).json({ message: 'Invalid token!' });
        }

        req.user = decoded as { id?: number; username?: string };

        next();
    } catch(err) {
        return res.status(401).json({ message: 'Invalid token!' })
    }
}

export default authMiddleware;