import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

import { pool } from './db.js';

async function test() {
    try {
        console.log('Testing DB connection...');
        const res = await pool.query('SELECT NOW()');
        console.log('DB Connection successful:', res.rows[0]);

        console.log('Checking for meditation_sessions table...');
        const table = await pool.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'meditation_sessions'
        `);

        if (table.rows.length > 0) {
            console.log('Table meditation_sessions EXISTS.');
        } else {
            console.log('Table meditation_sessions DOES NOT EXIST.');

            // Try to create it here
            console.log('Attempting to create table...');
            await pool.query(`
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
            console.log('Table created!');
        }

    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        await pool.end();
    }
}

test();
