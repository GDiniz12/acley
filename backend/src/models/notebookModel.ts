import { pool } from "../db.js";
import User from "./userModel.js";

class Notebook {
    name: string;
    idUser: number;

    constructor(name: string, idUser: number) {
        this.name = name;
        this.idUser = idUser;
    }

    static async createNotebook(name: string, idUser: number) {
        try {
            await pool.query("INSERT INTO notebook(name, id_user) VALUES (?, ?)", [name, idUser]);
            return true;
        } catch(err) {
            return { error: err };
        }
    }

    static async notebooksByUser(idUser: number) {
        try {
            const [notebooks] = await pool.query("SELECT id, name FROM notebooks WHERE id_user = ?", [idUser]);
            return { notebooks };
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