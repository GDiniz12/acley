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

    static async updateNotebook(idUser: number, idNotebook: number) {
        try {
            // search the user
            const user = await User.userByID(idUser);
            if (!user) {
                return { message: "User not found"};
            }
            if (user.error) {
                return { error: user.error}
            }
        } catch (err) {

        }
    }
}

export default Notebook;