import mysql from "mysql2/promise"
import "dotenv/config";

export const pool: mysql.Pool = mysql.createPool({
    host: process.env.HOST!,
    user: process.env.USER!,
    database: process.env.DB!,
    password: process.env.PASSWORD!,
    waitForConnections: true,
    connectionLimit: 10
});