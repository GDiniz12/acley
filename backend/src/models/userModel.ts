import { pool } from "../db.js";
import { type QueryResult } from "mysql2";

class User {
    username: string;
    email: string;
    password: string;

    constructor(username: string, email: string, password: string) {
        this.username = username;
        this.email = email;
        this.password = password;
    }

    static async allUsers(req: Request, res: Response) {
        try {
            const [users] = await pool.query("SELECT * FROM users");

            return res.status(200).json({ users });
        } catch(err) {
            return res.status(500).json({ message: "Fail database", error: err})
        }
    }
}