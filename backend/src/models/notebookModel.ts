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

    static async notebooksById(idNote: string | undefined) {
        try {
            const [notebooks] = await pool.query("SELECT name FROM notebooks WHERE id = ?", [idNote]);
            return { notebooks }
        } catch(err) {
            return { err }
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
            // 1. Buscar todas as matérias deste notebook
            const [matters]: any = await pool.query(
                "SELECT id FROM matters WHERE id_notebook = ?", 
                [idNotebook]
            );
            
            // 2. Para cada matéria, deletar tudo em cascata
            for (const matter of matters) {
                // 2.1. Buscar todas as submatérias desta matéria
                const [submatters]: any = await pool.query(
                    "SELECT id FROM submatters WHERE matter_parent = ?", 
                    [matter.id]
                );
                
                // 2.2. Deletar cards de cada submatéria
                for (const submatter of submatters) {
                    await pool.query("DELETE FROM cards WHERE submatter = ?", [submatter.id]);
                }
                
                // 2.3. Deletar todas as submatérias desta matéria
                await pool.query("DELETE FROM submatters WHERE matter_parent = ?", [matter.id]);
                
                // 2.4. Deletar cards diretos da matéria (sem submatéria)
                await pool.query(
                    "DELETE FROM cards WHERE matter_parent = ? AND submatter IS NULL", 
                    [matter.id]
                );
            }
            
            // 3. Deletar todas as matérias do notebook
            await pool.query("DELETE FROM matters WHERE id_notebook = ?", [idNotebook]);
            
            // 4. Finalmente, deletar o notebook
            await pool.query("DELETE FROM notebooks WHERE id = ?", [idNotebook]);
            
            return true;
        } catch(err) {
            console.error("Erro ao deletar notebook:", err);
            return { error: err };
        }
    }
}

export default Notebook;