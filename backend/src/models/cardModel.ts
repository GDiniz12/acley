import { pool } from "../db.js";

export type StatusCard = "new" | "review" | "learn";

export class Card {
    front: string;
    back: string;
    parentId: string;
    subMatterId: string;
    constructor(front: string, back: string, parentId: string, subMatterId: string) {
        this.front = front;
        this.back = back;
        this.parentId = parentId;
        this.subMatterId = subMatterId;
    }

    static async createCard(id: string, front: string, back: string, parentId: string, subMatterId: string, status: StatusCard) {
        try {
            await pool.query("INSERT INTO cards(id, front, back, matter_parent, subMatterId, status_card) VALUES(?, ?, ?, ?, ?, ?)", [id, front, back, parentId, subMatterId, status]);
            return true;
        } catch(err) {
            return { error: err };
        }
    }

    static async cardsByMatter(idMatter: string) {
        try {
            const [cards] = await pool.query("SELECT front, back FROM cards WHERE matter_parent = ?", [idMatter]);
            return { cards };
        } catch(err) {
            return { error: err };
        }
    }

    static async updateCard(front: string, back: string, idCard: string) {
        try {
            const fields = [];
            const values = [];

            if (front !== undefined) {
                fields.push("front = ?");
                values.push(front);
            }
            if (back !== undefined) {
                fields.push("back = ?");
                values.push(back);
            }

            const sql = `UPDATE cards SET ${fields.join(", ")} WHERE id = ?`;
            values.push(idCard);

            await pool.query(sql, values);
            return true;
        } catch(err) {
            return { error: err };
        }
    }

    static async deleteCard(idCard: string) {
        try {
            const [card] = await pool.query<Card[]>("SELECT id FROM cards WHERE id = ?", [idCard]);
            if (card.length === 0) return { message: "Card not found"};

            await pool.query("DELETE FROM cards WHERE id = ?", [idCard]);
            return { success: "Deleted"};
        } catch(err) {
            return { error: err };
        }
    }
}