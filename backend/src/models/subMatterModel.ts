import { pool } from "../db.js";

class SubMatter {
    name: string;
    matterParent: string;
    constructor(name: string, matterParent: string) {
        this.name = name;
        this.matterParent = matterParent;
    }

    static async createSubMatter(name: string, matterParent: string) {
        try {
            await pool.query("INSERT INTO submatters(name, matter_parent) VALUES (?, ?)", [name, matterParent]);
            return true;
        } catch(err) {
            return { error: err };
        }
    }

    static async subMattersByParent(idParent: string | undefined) {
        try {
            const [subMatters] = await pool.query<SubMatter[]>("SELECT id, name FROM submatters WHERE matter_parent = ?", [idParent]);

            if (subMatters.length === 0) return { message: "Submatters not found"};

            return { subMatters };
        } catch(err) {
            return { error: err };
        }
    }

    static async updateNameSubmatter(newName: string, idSubMatter: string)  {
        try {
            await pool.query("UPDATE submatters SET name = ? WHERE id = ?", [newName, idSubMatter]);
            return true;
        } catch(err) {
            return { error: err };
        }
    }

    static async deleteSubMatter(idSubMatter: string) {
        try {
            // 1. Primeiro, deletar todos os cards associados a esta submatéria
            await pool.query("DELETE FROM cards WHERE submatter = ?", [idSubMatter]);
            
            // 2. Depois, deletar a submatéria
            await pool.query("DELETE FROM submatters WHERE id = ?", [idSubMatter]);
            
            return true;
        } catch(err) {
            console.error("Erro ao deletar submatéria:", err);
            return { error: err };
        }
    }
}

export default SubMatter;