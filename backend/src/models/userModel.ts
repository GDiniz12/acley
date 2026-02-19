import { pool } from "../db.js";
import { type RowDataPacket } from "mysql2/promise";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";

interface UserRow extends RowDataPacket {
    id: number;
    username: string;
    password: string;
    email: string;
    created_at: Date;
}

class User {
    id: number;
    username: string;
    password: string
    createdAt: Date;

    constructor(id: number, username: string, password: string, createdAt: Date) {
        this.id = id;
        this.username = username;
        this.password = password;
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

            const [user] = await pool.query("SELECT id, username FROM users WHERE username = ?", [username]);

            return { user };
        } catch(err) {
            return { status: false, error: err}
        }
    }

    static async login(email: string, password: string) {
        try {
            const [user] = await pool.query<UserRow[]>("SELECT id, username, password FROM users WHERE email = ?", [email]);

            const isValidPassword = bcrypt.compareSync(password, user[0]?.password!);

            if (user.length === 0 || !isValidPassword) return { message: "invalid crendentials"};

            const payload = { id: user[0]?.id, username: user[0]?.username }

            const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1d"});

            return { token };
        } catch(err) {
            return { error: err}
        }
    }

    static async userByID(id: number | undefined) {
        try {
            const [user] = await pool.query<UserRow[]>("SELECT id, username, email, created_at FROM users WHERE id = ?", [id]);

            if (user.length === 0) return false;
            return user;
        } catch(err) {
            return { error: err}
        }
    }

    static async updateUser(username: string, email: string, password: string, idUser: number) {
        try {
            const [user] = await pool.query<UserRow[]>("SELECT username FROM users WHERE id = ?", [idUser]);
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