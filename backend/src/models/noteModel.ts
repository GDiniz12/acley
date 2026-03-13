import { pool } from "../db.js";
import { type RowDataPacket } from "mysql2/promise";

interface NoteRow extends RowDataPacket {
    id: number;
    title: string;
    content: string | null;
    id_user: number;
    folder_id: number | null;
    created_at: Date;
    updated_at: Date;
}

class Note {
    title: string;
    content: string | null;
    idUser: number;
    folderId: number | null;

    constructor(title: string, idUser: number, content: string | null = null, folderId: number | null = null) {
        this.title = title;
        this.content = content;
        this.idUser = idUser;
        this.folderId = folderId;
    }

    static async createNote(title: string, idUser: number, content: string | null = null, folderId: number | null = null) {
        try {
            const [result]: any = await pool.query(
                "INSERT INTO notes(title, content, id_user, folder_id) VALUES (?, ?, ?, ?)",
                [title, content, idUser, folderId]
            );
            const [note] = await pool.query<NoteRow[]>(
                "SELECT id, title, content, folder_id, created_at, updated_at FROM notes WHERE id = ?",
                [result.insertId]
            );
            return { note: note[0] };
        } catch (err) {
            return { error: err };
        }
    }

    // Notas soltas do usuário (sem pasta)
    static async rootNotesByUser(idUser: number | undefined) {
        try {
            const [notes] = await pool.query<NoteRow[]>(
                `SELECT id, title, folder_id, created_at, updated_at
                 FROM notes
                 WHERE id_user = ? AND folder_id IS NULL
                 ORDER BY updated_at DESC`,
                [idUser]
            );
            return { notes };
        } catch (err) {
            return { error: err };
        }
    }

    // Notas de uma pasta específica
    static async notesByFolder(folderId: number, idUser: number | undefined) {
        try {
            const [notes] = await pool.query<NoteRow[]>(
                `SELECT id, title, folder_id, created_at, updated_at
                 FROM notes
                 WHERE folder_id = ? AND id_user = ?
                 ORDER BY updated_at DESC`,
                [folderId, idUser]
            );
            return { notes };
        } catch (err) {
            return { error: err };
        }
    }

    // Busca nota completa (com content) por ID
    static async noteById(idNote: number, idUser: number | undefined) {
        try {
            const [notes] = await pool.query<NoteRow[]>(
                `SELECT id, title, content, folder_id, created_at, updated_at
                 FROM notes
                 WHERE id = ? AND id_user = ?`,
                [idNote, idUser]
            );
            if (notes.length === 0) return { notFound: true };
            return { note: notes[0] };
        } catch (err) {
            return { error: err };
        }
    }

    // Busca todas as notas do usuário (sem content para performance)
    static async allNotesByUser(idUser: number | undefined) {
        try {
            const [notes] = await pool.query<NoteRow[]>(
                `SELECT id, title, folder_id, created_at, updated_at
                 FROM notes
                 WHERE id_user = ?
                 ORDER BY updated_at DESC`,
                [idUser]
            );
            return { notes };
        } catch (err) {
            return { error: err };
        }
    }

    // Busca notas por título (search)
    static async searchNotes(idUser: number | undefined, query: string) {
        try {
            const [notes] = await pool.query<NoteRow[]>(
                `SELECT id, title, folder_id, created_at, updated_at
                 FROM notes
                 WHERE id_user = ? AND (title LIKE ? OR content LIKE ?)
                 ORDER BY updated_at DESC`,
                [idUser, `%${query}%`, `%${query}%`]
            );
            return { notes };
        } catch (err) {
            return { error: err };
        }
    }

    static async updateNote(idNote: number, idUser: number | undefined, title?: string, content?: string, folderId?: number | null) {
        try {
            const fields: string[] = [];
            const values: any[] = [];

            if (title !== undefined) {
                fields.push("title = ?");
                values.push(title);
            }
            if (content !== undefined) {
                fields.push("content = ?");
                values.push(content);
            }
            if (folderId !== undefined) {
                fields.push("folder_id = ?");
                values.push(folderId);
            }

            if (fields.length === 0) return { error: "Nenhum campo para atualizar" };

            const sql = `UPDATE notes SET ${fields.join(", ")} WHERE id = ? AND id_user = ?`;
            values.push(idNote, idUser);

            const [result]: any = await pool.query(sql, values);

            if (result.affectedRows === 0) return { error: "Note not found", notFound: true };
            return true;
        } catch (err) {
            return { error: err };
        }
    }

    static async deleteNote(idNote: number, idUser: number | undefined) {
        try {
            const [result]: any = await pool.query(
                "DELETE FROM notes WHERE id = ? AND id_user = ?",
                [idNote, idUser]
            );
            if (result.affectedRows === 0) return { error: "Note not found", notFound: true };
            return true;
        } catch (err) {
            return { error: err };
        }
    }
}

export default Note;