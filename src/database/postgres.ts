import { Pool } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const database = `
  CREATE TABLE credit_cards(
  id  SERIAL PRIMARY KEY,
  card_number VARCHAR(16),
  cvv VARCHAR(4),
  expiration_month VARCHAR(2),
  expiration_year CHAR(4),
  email VARCHAR(100),
  token VARCHAR(16)
)`;

export const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
});

const createDatabase = async () => {
  try {
    const client = await pool.connect();

    await client.query(database);

    console.log("Base de datos creada exitosamente");

    client.release();
  } catch (error) {
    console.error("Error al crear la base de datos:", error);
  } finally {
    await pool.end();
  }
};
