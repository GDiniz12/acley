import { pool } from "../db.js";
import bcrypt from "bcrypt";

class User {
    id: number;
    username: string;
    createdAt: Date;

    constructor(id: number, username: string, createdAt: Date) {
        this.id = id;
        this.username = username;
        this.createdAt = createdAt;
    }

    static async allUsers() {
        try {
            const [users] = await pool.query("SELECT id, username, created_at FROM users");

            return {users};
        } catch(err) {
            return { error: err }
        }
    }

    static async createUser(username: string, email: string, password: string) {
        try {
            const newPassword: string = bcrypt.hashSync(password, 12);
            await pool.query("INSERT INTO users(username, email, password) VALUES(?, ?, ?)", [username, email, newPassword]);
            return true;
        } catch(err) {
            return { status: false, error: err}
        }
    }

    static async userByID(id: number) {
        try {
            const [user] = await pool.query<User[]>("SELECT id, username, created_at FROM users WHERE id = ?", [id]);

            if (user.length === 0) return false;
            return { user };
        } catch(err) {
            return { error: err}
        }
    }
}

export default User;