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

    static async updateUser(username: string, email: string, password: string, idUser: number) {
        try {
            const [user] = await pool.query<User[]>("SELECT username FROM users WHERE id = ?", [idUser]);
            if (user.length === 0) return { message: "User not found"};

            const fields = [];
            const values = [];

            if (username !== undefined) {
                fields.push("username = ?");
                values.push(username);
            }
            if (email !== undefined) {
                fields.push("email = ?");
                values.push(email);
            }
            if (password !== undefined) {
                fields.push("password = ?");
                values.push(password);
            }

            const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;
            values.push(idUser);

            await pool.query(sql, values);

            return { message: "Updated successfuly"};
        } catch(err) {
            return { error: err };
        }
    }

    static async deleteUser(idUser: number) {
        try {
            await pool.query("DELETE FROM users FROM id = ?", [idUser]);
            return true;
        } catch(err) {
            return { error: err };
        }
    }
}

export default User;