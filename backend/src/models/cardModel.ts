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
            const [cards] = await pool.query("SELECT id, front, back, status_card FROM cards WHERE matter_parent = ? AND submatter IS NULL", [idMatter]);
            return { cards };
        } catch(err) {
            return { error: err };
        }
    }

    static async cardsBySubMatter(idSubMatter: string | undefined) {
        try {
            const [cards] = await pool.query("SELECT id, front, back, status_card FROM cards WHERE submatter = ?", [idSubMatter]);
            return { cards };
        } catch(err) {
            return { error: err };
        }
    }

    static async getAllCardsForReview(idMatter: string | undefined, includeSubmatters: boolean = true) {
        try {
            let cards: any[] = [];
            
            if (includeSubmatters) {
                // Buscar cards da matéria E de todas as suas submatérias
                const [allCards] = await pool.query<any[]>(
                    `SELECT c.id, c.front, c.back, c.status_card, c.submatter
                     FROM cards c
                     LEFT JOIN submatters s ON c.submatter = s.id
                     WHERE c.matter_parent = ?
                     ORDER BY 
                        CASE c.status_card 
                            WHEN 'new' THEN 1 
                            WHEN 'learn' THEN 2 
                            WHEN 'review' THEN 3 
                        END,
                        c.id`,
                    [idMatter]
                );
                cards = allCards;
            } else {
                // Buscar apenas cards diretos da matéria (sem submatéria)
                const [directCards] = await pool.query<any[]>(
                    `SELECT id, front, back, status_card, submatter
                     FROM cards 
                     WHERE matter_parent = ? AND submatter IS NULL
                     ORDER BY 
                        CASE status_card 
                            WHEN 'new' THEN 1 
                            WHEN 'learn' THEN 2 
                            WHEN 'review' THEN 3 
                        END,
                        id`,
                    [idMatter]
                );
                cards = directCards;
            }
            
            return { cards };
        } catch(err) {
            return { error: err };
        }
    }

    static async updateCardStatus(idCard: string, newStatus: StatusCard, nextReviewDate?: Date) {
        try {
            const now = new Date();
            
            // Calcular próxima data de revisão baseado na dificuldade
            let reviewDate = nextReviewDate;
            if (!reviewDate) {
                reviewDate = new Date(now);
                // Se não especificado, usa data atual
            }
            
            await pool.query(
                "UPDATE cards SET status_card = ?, last_reviewed = ?, next_review = ? WHERE id = ?",
                [newStatus, now, reviewDate, idCard]
            );
            
            return true;
        } catch(err) {
            return { error: err };
        }
    }

    static async countCardsByMatter(idMatter: string | undefined) {
        try {
            // Contar cards diretamente associados à matéria (sem submatéria)
            const [directCards] = await pool.query<any[]>(
                `SELECT 
                    status_card,
                    COUNT(*) as count
                FROM cards 
                WHERE matter_parent = ? AND submatter IS NULL
                GROUP BY status_card`,
                [idMatter]
            );
            
            // Contar cards de todas as submatérias desta matéria
            const [subMatterCards] = await pool.query<any[]>(
                `SELECT 
                    c.status_card,
                    COUNT(*) as count
                FROM cards c
                INNER JOIN submatters s ON c.submatter = s.id
                WHERE s.matter_parent = ?
                GROUP BY c.status_card`,
                [idMatter]
            );
            
            const counts = {
                new: 0,
                learn: 0,
                review: 0
            };

            // Somar cards diretos
            directCards.forEach((row: any) => {
                if (row.status_card === 'new') counts.new += row.count;
                if (row.status_card === 'learn') counts.learn += row.count;
                if (row.status_card === 'review') counts.review += row.count;
            });

            // Somar cards das submatérias
            subMatterCards.forEach((row: any) => {
                if (row.status_card === 'new') counts.new += row.count;
                if (row.status_card === 'learn') counts.learn += row.count;
                if (row.status_card === 'review') counts.review += row.count;
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