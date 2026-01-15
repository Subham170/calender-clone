import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initDatabase() {
  try {
    const schemaPath = path.join(__dirname, "schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    await pool.query(schema);
    console.log("Database schema initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

// Run if executed directly (check if this file is the main module)
const runAsScript = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (runAsScript) {
  initDatabase()
    .then(() => {
      console.log("Database initialization complete");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database initialization failed:", error);
      process.exit(1);
    });
}

export default initDatabase;
