import { pool } from "../db.js";

const usersController = {
    // GET for search all users
    allUsers: async (req, res) => {
        try {
            const [rows] = await pool.query("SELECT id, username, created_at FROM users");

            return res.status(200).json(rows[0]);
        } catch(err) {
            return res.status(500).json({ message: "Internal server error 500"});
        }
    },
    // GET for search a user by id
    userByID: async (req, res) => {
        const { id } = req.params;

        try {
            const [rows] = await pool.query("SELECT id, username, created_at FROM users WHERE id = ?", [id]);

            return res.status(200).json(rows[0]);
        } catch(err) {
            return res.status(500).json({ message: "Internal server error 500"});
        }
    },

    createUser: async (req, res) => {
        const { username, email, password } = req.body;

        try {
            await pool.query("INSERT INTO users(username, email, password) VALUES(?, ?, ?)", [username, email, password]);

            res.status(201).json({ message: "Successful!"});
        } catch(err) {
            res.status(500).json({ message: "Internal server error 500"});
        }
    },
    // PUT for update a user
    // DELETE for delete a user
    deleteUserByUsername: async (req, res) => {
        const { username } = req.body;

        try {
            const [rows] = await pool.query("DELETE FROM users WHERE username = ?", [username]);

            return res.status(201).json(rows[0]);
        } catch(err) {
            res.status(500).json({ message: "Internal server error 500"});
        }
    }
}

export default usersController;