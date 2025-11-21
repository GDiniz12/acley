import { pool } from "../db.js";

class Matter {
    name: string;
    idNotebook: number;
    constructor(name: string, idNotebook: number) {
        this.name = name;
        this.idNotebook = idNotebook;
    }

    static async createMatter(name: string, idNotebook: number) {
        try {
            await pool.query("INSERT INTO matters(name, id_notebook) VALUES (?, ?)", [name, idNotebook]);
            return true;
        } catch(err) {
            return { error: err };
        }
    }

    static async mattersByNotebook(idNotebook: string) {
        try {
            const [matters] = await pool.query("SELECT id, name FROM notebooks WHERE id_notebook = ?", [idNotebook]);
            return { matters };
        } catch(err) {
            return { error: err };
        }
    }
}