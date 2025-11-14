import { pool } from "../db.js";

class User {
    username: string;
    email: string;
    password: string;

    constructor(username: string, email: string, password: string) {
        this.username = username;
        this.email = email;
        this.password = password;
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
            await pool.query("INSERT INTO users(username, email, password) VALUES(?, ?, ?)", [username, email, password]);
            return true;
        } catch(err) {
            return { status: false, error: err}
        }
    }
}

export default User;