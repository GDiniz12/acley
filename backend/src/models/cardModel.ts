import { pool } from "../db.js";

export type StatusCard = "new" | "review" | "learn";

export class Card {
    front: string;
    back: string;
    parentId: string;
    subMatterId: string | null;
    constructor(front: string, back: string, parentId: string, subMatterId: string | null) {
        this.front = front;
        this.back = back;
        this.parentId = parentId;
        this.subMatterId = subMatterId;
    }

    static async createCard(front: string, back: string, parentId: string, subMatterId: string | null, status: StatusCard) {
        try {
            await pool.query(
                "INSERT INTO cards(front, back, matter_parent, submatter, status_card) VALUES(?, ?, ?, ?, ?)", 
                [front, back, parentId, subMatterId, status]
            );
            return true;
        } catch(err) {
            return { error: err };
        }
    }

    static async cardsByMatter(idMatter: string | undefined) {
        try {
            const [cards] = await pool.query("SELECT front, back FROM cards WHERE matter_parent = ?", [idMatter]);
            return { cards };
        } catch(err) {
            return { error: err };
        }
    }

    static async cardsBySubMatter(idSubMatter: string | undefined) {
        try {
            const [cards] = await pool.query("SELECT front, back FROM cards WHERE submatter = ?", [idSubMatter]);
            return { cards };
        } catch(err) {
            return { error: err };
        }
    }

    static async countCardsByMatter(idMatter: string | undefined) {
        try {
            const [result] = await pool.query<any[]>(
                `SELECT 
                    status_card,
                    COUNT(*) as count
                FROM cards 
                WHERE matter_parent = ?
                GROUP BY status_card`,
                [idMatter]
            );
            
            const counts = {
                new: 0,
                learn: 0,
                review: 0
            };

            result.forEach((row: any) => {
                if (row.status_card === 'new') counts.new = row.count;
                if (row.status_card === 'learn') counts.learn = row.count;
                if (row.status_card === 'review') counts.review = row.count;
            });

            return counts;
        } catch(err) {
            return { error: err };
        }
    }

    static async countCardsBySubMatter(idSubMatter: string | undefined) {
        try {
            const [result] = await pool.query<any[]>(
                `SELECT 
                    status_card,
                    COUNT(*) as count
                FROM cards 
                WHERE submatter = ?
                GROUP BY status_card`,
                [idSubMatter]
            );
            
            const counts = {
                new: 0,
                learn: 0,
                review: 0
            };

            result.forEach((row: any) => {
                if (row.status_card === 'new') counts.new = row.count;
                if (row.status_card === 'learn') counts.learn = row.count;
                if (row.status_card === 'review') counts.review = row.count;
            });

            return counts;
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