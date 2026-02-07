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
            // 1. Primeiro, buscar todas as submatérias desta matéria
            const [submatters]: any = await pool.query(
                "SELECT id FROM submatters WHERE matter_parent = ?", 
                [idMatter]
            );
            
            // 2. Deletar cards de cada submatéria
            for (const submatter of submatters) {
                await pool.query("DELETE FROM cards WHERE submatter = ?", [submatter.id]);
            }
            
            // 3. Deletar todas as submatérias
            await pool.query("DELETE FROM submatters WHERE matter_parent = ?", [idMatter]);
            
            // 4. Deletar cards diretos da matéria (sem submatéria)
            await pool.query("DELETE FROM cards WHERE matter_parent = ? AND submatter IS NULL", [idMatter]);
            
            // 5. Finalmente, deletar a matéria
            await pool.query("DELETE FROM matters WHERE id = ?", [idMatter]);
            
            return true;
        } catch(err) {
            console.error("Erro ao deletar matéria:", err);
            return { error: err };
        }
    }
}

export default Matter;