import { Pool } from "pg";

export const initDB = () => {
    const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 5432;

    return new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DATABASE,
      password: process.env.DB_PASSWORD,
      port: port,
    });
};
