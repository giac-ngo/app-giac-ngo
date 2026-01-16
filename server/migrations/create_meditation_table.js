// server/migrations/create_meditation_table.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

async function createTable() {
    const client = await pool.connect();

    try {
        console.log('Creating meditation_sessions table...');

        await client.query('BEGIN');

        // Create table
        await client.query(`
            CREATE TABLE IF NOT EXISTS meditation_sessions (
                id SERIAL PRIMARY KEY,
                space_id INTEGER REFERENCES spaces(id) ON DELETE CASCADE,
                title VARCHAR(255) NOT NULL,
                title_en VARCHAR(255),
                description TEXT,
                description_en TEXT,
                audio_url VARCHAR(500) NOT NULL,
                audio_url_en VARCHAR(500),
                duration INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW(),
                UNIQUE(space_id)
            );
        `);

        // Create index
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_meditation_space_id 
            ON meditation_sessions(space_id);
        `);

        await client.query('COMMIT');
        console.log('✓ Table created successfully!');

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating table:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

createTable()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
