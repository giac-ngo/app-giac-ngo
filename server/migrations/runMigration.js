// server/migrations/runMigration.js
// Script to update all users with null merits to 0

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '..', '..', '.env') });

async function runMigration() {
    const client = await pool.connect();

    try {
        console.log('Starting migration: Update null merits and requests_remaining to 0...');

        // Start transaction
        await client.query('BEGIN');

        // Get count of users with null values before update
        const beforeResult = await client.query(`
            SELECT 
                COUNT(*) FILTER (WHERE merits IS NULL) as null_merits,
                COUNT(*) FILTER (WHERE requests_remaining IS NULL) as null_requests
            FROM users
        `);
        const nullMerits = parseInt(beforeResult.rows[0].null_merits);
        const nullRequests = parseInt(beforeResult.rows[0].null_requests);

        console.log(`Found ${nullMerits} users with null merits`);
        console.log(`Found ${nullRequests} users with null requests_remaining`);

        if (nullMerits === 0 && nullRequests === 0) {
            console.log('No users need to be updated. Migration skipped.');
            await client.query('ROLLBACK');
            return;
        }

        // Update null merits to 0
        if (nullMerits > 0) {
            const meritsResult = await client.query(
                'UPDATE users SET merits = 0 WHERE merits IS NULL'
            );
            console.log(`Updated ${meritsResult.rowCount} users' merits`);
        }

        // Update null requests_remaining to 0
        if (nullRequests > 0) {
            const requestsResult = await client.query(
                'UPDATE users SET requests_remaining = 0 WHERE requests_remaining IS NULL'
            );
            console.log(`Updated ${requestsResult.rowCount} users' requests_remaining`);
        }

        // Verify the update
        const afterResult = await client.query(`
            SELECT 
                COUNT(*) FILTER (WHERE merits IS NULL) as null_merits,
                COUNT(*) FILTER (WHERE requests_remaining IS NULL) as null_requests
            FROM users
        `);
        const afterNullMerits = parseInt(afterResult.rows[0].null_merits);
        const afterNullRequests = parseInt(afterResult.rows[0].null_requests);

        if (afterNullMerits === 0 && afterNullRequests === 0) {
            console.log('✓ Migration successful! All null values have been updated to 0');
            await client.query('COMMIT');
        } else {
            console.error(`✗ Migration failed!`);
            console.error(`  Still ${afterNullMerits} users with null merits`);
            console.error(`  Still ${afterNullRequests} users with null requests_remaining`);
            await client.query('ROLLBACK');
        }

    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Migration error:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Run the migration
runMigration()
    .then(() => {
        console.log('Migration completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration failed:', error);
        process.exit(1);
    });
