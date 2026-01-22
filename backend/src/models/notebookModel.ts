import { pool } from "../db.js";

class Notebook {
    name: string;
    idUser: number;

    constructor(name: string, idUser: number) {
        this.name = name;
        this.idUser = idUser;
    }

    static async createNotebook(name: string, idUser: number) {
        try {
            const notebook = await pool.query("INSERT INTO notebooks(name, id_user) VALUES (?, ?)", [name, idUser]);
            const [notebookResult] = await pool.query("SELECT * FROM notebooks WHERE id = ?", [notebook[0].insertId]);
            return notebookResult;
        } catch(err) {
            return { error: err };
        }
    }

    static async notebooksByUser(idUser: number | undefined) {
        try {
            const [notebooks] = await pool.query("SELECT id, name FROM notebooks WHERE id_user = ?", [idUser]);
            return notebooks;
        } catch (err) {
            return { error: err };
        }
    }
    
    static async updateNameNotebook(idNotebook: number, newName: string) {
        try {
            await pool.query("UPDATE notebooks SET name = ? WHERE id = ?", [newName, idNotebook]);
            return true;
        } catch (err) {
            return { error: err };
        }
    }

    static async deleteNotebook(idNotebook: number) {
        try {
            await pool.query("DELETE FROM notebooks WHERE id = ?", [idNotebook]);
            return true;
        } catch(err) {
            return { error: err };
        }
    }
}

export default Notebook;