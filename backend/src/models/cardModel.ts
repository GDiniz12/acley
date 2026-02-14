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
            const now = new Date();
            
            // Filtrar apenas cards disponíveis (next_review IS NULL ou next_review <= NOW)
            const [cards] = await pool.query(
                `SELECT id, front, back, status_card 
                 FROM cards 
                 WHERE matter_parent = ? 
                   AND submatter IS NULL
                   AND (next_review IS NULL OR next_review <= ?)
                 ORDER BY 
                    CASE status_card 
                        WHEN 'new' THEN 1 
                        WHEN 'learn' THEN 2 
                        WHEN 'review' THEN 3 
                    END,
                    id`,
                [idMatter, now]
            );
            
            return { cards };
        } catch(err) {
            return { error: err };
        }
    }

    static async cardsBySubMatter(idSubMatter: string | undefined) {
        try {
            const now = new Date();
            
            // Filtrar apenas cards disponíveis (next_review IS NULL ou next_review <= NOW)
            const [cards] = await pool.query(
                `SELECT id, front, back, status_card 
                 FROM cards 
                 WHERE submatter = ?
                   AND (next_review IS NULL OR next_review <= ?)
                 ORDER BY 
                    CASE status_card 
                        WHEN 'new' THEN 1 
                        WHEN 'learn' THEN 2 
                        WHEN 'review' THEN 3 
                    END,
                    id`,
                [idSubMatter, now]
            );
            
            return { cards };
        } catch(err) {
            return { error: err };
        }
    }

    static async getAllCardsForReview(idMatter: string | undefined, includeSubmatters: boolean = true) {
        try {
            const now = new Date();
            let cards: any[] = [];
            
            if (includeSubmatters) {
                // Buscar cards da matéria E de todas as suas submatérias
                // APENAS cards disponíveis (next_review IS NULL ou next_review <= NOW)
                const [allCards] = await pool.query<any[]>(
                    `SELECT c.id, c.front, c.back, c.status_card, c.submatter
                     FROM cards c
                     LEFT JOIN submatters s ON c.submatter = s.id
                     WHERE c.matter_parent = ?
                       AND (c.next_review IS NULL OR c.next_review <= ?)
                     ORDER BY 
                        CASE c.status_card 
                            WHEN 'new' THEN 1 
                            WHEN 'learn' THEN 2 
                            WHEN 'review' THEN 3 
                        END,
                        c.id`,
                    [idMatter, now]
                );
                cards = allCards;
            } else {
                // Buscar apenas cards diretos da matéria (sem submatéria)
                // APENAS cards disponíveis (next_review IS NULL ou next_review <= NOW)
                const [directCards] = await pool.query<any[]>(
                    `SELECT id, front, back, status_card, submatter
                     FROM cards 
                     WHERE matter_parent = ? 
                       AND submatter IS NULL
                       AND (next_review IS NULL OR next_review <= ?)
                     ORDER BY 
                        CASE status_card 
                            WHEN 'new' THEN 1 
                            WHEN 'learn' THEN 2 
                            WHEN 'review' THEN 3 
                        END,
                        id`,
                    [idMatter, now]
                );
                cards = directCards;
            }
            
            return { cards };
        } catch(err) {
            return { error: err };
        }
    }

    static async updateCardStatus(idCard: string, newStatus: StatusCard, difficulty: 'easy' | 'medium' | 'hard') {
        try {
            const now = new Date();
            let nextReviewDate: Date | null = null;
            
            // Calcular próxima revisão baseado na dificuldade
            if (difficulty === 'easy') {
                // 7 dias
                nextReviewDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            } else if (difficulty === 'medium') {
                // 3 dias
                nextReviewDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
            } else if (difficulty === 'hard') {
                // 5 minutos
                nextReviewDate = new Date(now.getTime() + 5 * 60 * 1000);
            }
            
            // Atualizar status, last_reviewed e next_review
            await pool.query(
                "UPDATE cards SET status_card = ?, last_reviewed = ?, next_review = ? WHERE id = ?",
                [newStatus, now, nextReviewDate, idCard]
            );
            
            return true;
        } catch(err) {
            console.error("Erro em updateCardStatus:", err);
            return { error: err };
        }
    }

    static async countCardsByMatter(idMatter: string | undefined) {
        try {
            const now = new Date();
            
            // Contar cards diretamente associados à matéria (sem submatéria)
            const [directCards] = await pool.query<any[]>(
                `SELECT 
                    status_card,
                    COUNT(*) as count
                FROM cards 
                WHERE matter_parent = ? 
                  AND submatter IS NULL
                  AND (next_review IS NULL OR next_review <= ?)
                GROUP BY status_card`,
                [idMatter, now]
            );
            
            // Contar cards de todas as submatérias desta matéria
            const [subMatterCards] = await pool.query<any[]>(
                `SELECT 
                    c.status_card,
                    COUNT(*) as count
                FROM cards c
                INNER JOIN submatters s ON c.submatter = s.id
                WHERE s.matter_parent = ?
                  AND (c.next_review IS NULL OR c.next_review <= ?)
                GROUP BY c.status_card`,
                [idMatter, now]
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
            const now = new Date();
            
            const [result] = await pool.query<any[]>(
                `SELECT 
                    status_card,
                    COUNT(*) as count
                FROM cards 
                WHERE submatter = ?
                  AND (next_review IS NULL OR next_review <= ?)
                GROUP BY status_card`,
                [idSubMatter, now]
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