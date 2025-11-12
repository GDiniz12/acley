import { createPool, type Pool } from "mysql2";
import "dotenv/config";

export const pool: Pool = createPool({
    host: 'localhost',
    user: 'root',
    database: 'db_acley',
    password: 'Gabigol12345',
    waitForConnections: true,
    connectionLimit: 10
});