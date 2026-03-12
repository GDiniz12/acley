import { pool } from "../db.js";
import { type RowDataPacket } from "mysql2/promise";

interface NoteFolderRow extends RowDataPacket {
    id: number;
    name: string;
    id_user: number;
    parent_folder: number | null;
    created_at: Date;
}

class NoteFolder {
    name: string;
    idUser: number;
    parentFolder: number | null;

    constructor(name: string, idUser: number, parentFolder: number | null = null) {
        this.name = name;
        this.idUser = idUser;
        this.parentFolder = parentFolder;
    }

    static async createFolder(name: string, idUser: number, parentFolder: number | null = null) {
        try {
            const [result]: any = await pool.query(
                "INSERT INTO note_folders(name, id_user, parent_folder) VALUES (?, ?, ?)",
                [name, idUser, parentFolder]
            );
            return { id: result.insertId };
        } catch (err) {
            return { error: err };
        }
    }

    // Busca pastas raiz do usuário (sem pasta pai)
    static async rootFoldersByUser(idUser: number | undefined) {
        try {
            const [folders] = await pool.query<NoteFolderRow[]>(
                `SELECT id, name, parent_folder, created_at
                 FROM note_folders
                 WHERE id_user = ? AND parent_folder IS NULL
                 ORDER BY name ASC`,
                [idUser]
            );
            return { folders };
        } catch (err) {
            return { error: err };
        }
    }

    // Busca subpastas filhas de uma pasta
    static async subFoldersByParent(parentFolder: number, idUser: number | undefined) {
        try {
            const [folders] = await pool.query<NoteFolderRow[]>(
                `SELECT id, name, parent_folder, created_at
                 FROM note_folders
                 WHERE parent_folder = ? AND id_user = ?
                 ORDER BY name ASC`,
                [parentFolder, idUser]
            );
            return { folders };
        } catch (err) {
            return { error: err };
        }
    }

    // Busca todas as pastas do usuário (para montar a árvore no front)
    static async allFoldersByUser(idUser: number | undefined) {
        try {
            const [folders] = await pool.query<NoteFolderRow[]>(
                `SELECT id, name, parent_folder, created_at
                 FROM note_folders
                 WHERE id_user = ?
                 ORDER BY parent_folder ASC, name ASC`,
                [idUser]
            );
            return { folders };
        } catch (err) {
            return { error: err };
        }
    }

    static async updateFolder(idFolder: number, newName: string, idUser: number | undefined) {
        try {
            const [result]: any = await pool.query(
                "UPDATE note_folders SET name = ? WHERE id = ? AND id_user = ?",
                [newName, idFolder, idUser]
            );
            if (result.affectedRows === 0) return { error: "Folder not found", notFound: true };
            return true;
        } catch (err) {
            return { error: err };
        }
    }

    // Deleta a pasta e todas as subpastas + notas em cascata
    static async deleteFolder(idFolder: number, idUser: number | undefined) {
        try {
            // Coleta recursiva de todas as pastas filhas
            const folderIds = await NoteFolder._collectFolderIds(idFolder);

            // Deleta todas as notas das pastas coletadas
            if (folderIds.length > 0) {
                await pool.query(
                    `DELETE FROM notes WHERE folder_id IN (${folderIds.map(() => "?").join(",")})`,
                    folderIds
                );
                await pool.query(
                    `DELETE FROM note_folders WHERE id IN (${folderIds.map(() => "?").join(",")}) AND id_user = ?`,
                    [...folderIds, idUser]
                );
            }

            return true;
        } catch (err) {
            console.error("Erro ao deletar pasta:", err);
            return { error: err };
        }
    }

    // Coleta IDs de uma pasta e todas as suas descendentes (BFS)
    private static async _collectFolderIds(rootId: number): Promise<number[]> {
        const ids: number[] = [rootId];
        const queue: number[] = [rootId];

        while (queue.length > 0) {
            const current = queue.shift()!;
            const [children] = await pool.query<NoteFolderRow[]>(
                "SELECT id FROM note_folders WHERE parent_folder = ?",
                [current]
            );
            for (const child of children) {
                ids.push(child.id);
                queue.push(child.id);
            }
        }

        return ids;
    }
}

export default NoteFolder;