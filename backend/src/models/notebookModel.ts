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
}

export default Notebook;