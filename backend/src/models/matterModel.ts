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

    static async mattersByNotebook(idNotebook: string | undefined) {
        try {
            const [matters] = await pool.query("SELECT id, name FROM matters WHERE id_notebook = ?", [idNotebook]);
            return { matters };
        } catch(err) {
            return { err };
        }
    }

    static async updateMatter(idMatter: number, newName: string) {
        try {
            await pool.query("UPDATE matters SET name = ? WHERE id = ?", [newName, idMatter]);
            return true;
        } catch(err) {
            return { error: err };
        }
    }

    static async deleteMatter(idMatter: number) {
        try {
            await pool.query("DELETE FROM matters WHERE id = ?", [idMatter]);
            return true;
        } catch(err) {
            return { error: err };
        }
    }
}

export default Matter;