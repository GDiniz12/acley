import mysql from "mysql2/promise"
import "dotenv/config";

export const pool: mysql.Pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    database: 'db_acley',
    password: 'Gabigol12345',
    waitForConnections: true,
    connectionLimit: 10
});