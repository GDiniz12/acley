import { pool } from "../db.js";

class SubMatter {
    name: string;
    matterParent: string;
    constructor(name: string, matterParent: string) {
        this.name = name;
        this.matterParent = matterParent;
    }

    static async createSubMatter(id: string, name: string, matterParent: string) {
        try {
            await pool.query("INSERT INTO submatters(id, name, matter_parent) VALUES (?, ?, ?)", [id, name, matterParent]);
            return true;
        } catch(err) {
            return { error: err };
        }
    }

    static async subMattersByParent(idParent: string) {
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
            await pool.query("UPDATE submatters SET name = ? WHERE id = ?", [idSubMatter]);
            return true;
        } catch(err) {
            return { error: err };
        }
    }

    static async deleteSubMatter(idSubMatter: string) {
        try {
            await pool.query("DELETE FROM submatters WHERE id = ?", [idSubMatter]);
            return true;
        } catch(err) {
            return { error: err };
        }
    }
}