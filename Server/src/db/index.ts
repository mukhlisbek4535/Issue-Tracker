import pkg from 'pg';
import dotenv from 'dotenv';
const { Pool } = pkg;

const isProduction = process.env.NODE_ENV === 'production';

dotenv.config();
const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

export default pool;
