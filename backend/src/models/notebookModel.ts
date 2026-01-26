import { pool } from "../db.js";
import { v4 as uuidv4 } from 'uuid';

class Notebook {
    name: string;
    idUser: number;

    constructor(name: string, idUser: number) {
        this.name = name;
        this.idUser = idUser;
    }

    static async createNotebook(name: string, idUser: number) {
        try {
            const id: string = uuidv4();
            await pool.query("INSERT INTO notebooks(id, name, id_user) VALUES (?, ?, ?)", [id, name, idUser]);
            const [notebookResult] = await pool.query("SELECT * FROM notebooks WHERE id = ?", [id]);
            return { notebook: notebookResult}
        } catch(err) {
            return { error: err}
        }
    }

    static async notebooksByUser(idUser: number | undefined) {
        try {
            const [notebooks] = await pool.query("SELECT id, name FROM notebooks WHERE id_user = ?", [idUser]);
            return notebooks;
        } catch (err) {
            return err;
        }
    }
    
    static async updateNameNotebook(idNotebook: string | undefined, newName: string) {
        try {
            const [result]: any = await pool.query(
                "UPDATE notebooks SET name = ? WHERE id = ?", 
                [newName, idNotebook]
            );
        
            if (result.affectedRows === 0) {
                return { error: "Notebook não encontrado", notFound: true };
            }
        
            return true;
        } catch (err) {
            console.error("Erro ao atualizar notebook:", err);
            return { error: "Erro ao atualizar notebook" };
        }
    }

    static async deleteNotebook(idNotebook: string | undefined) {
        try {
            await pool.query("DELETE FROM notebooks WHERE id = ?", [idNotebook]);
            return true;
        } catch(err) {
            return { error: err };
        }
    }
}

export default Notebook;