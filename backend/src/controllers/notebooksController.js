import { pool } from "../db.js";

const notebooksController = {
    createNotebook: async (req, res) => {
        const { name, idUser } = req.body;

        try {
            const [ins] = await pool.query("INSERT INTO notebooks(name, id_user) VALUES(?, ?)", [name, idUser]);

            const [rows] = await pool.query("SELECT id, name, id_user FROM notebooks");
            res.status(201).json(rows[0]);
        } catch (err) {
            res.status(500).json({ message: "Failed 500"});
        }
    }
}