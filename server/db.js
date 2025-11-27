// server/db.js
import pg from 'pg';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Helper function to map database rows to camelCase object keys
export const mapRowToCamelCase = (row) => {
    if (!row) return null;
    const newObj = {};
    for (const key in row) {
        const camelCaseKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        newObj[camelCaseKey] = row[key];
    }
    return newObj;
};

export const verifyPassword = async (plainPassword, storedPassword) => {
    let isMatch = false;
    if (!storedPassword) return false;

    if (storedPassword.startsWith('scrypt:')) {
      const parts = storedPassword.split('$');
      if (parts.length !== 3) return false;
      const [header, salt, hash] = parts;
      const headerParts = header.split(':');
      if (headerParts.length !== 4 || headerParts[0] !== 'scrypt') return false;
      const N = parseInt(headerParts[1], 10);
      const r = parseInt(headerParts[2], 10);
      const p = parseInt(headerParts[3], 10);
      const hashBuffer = Buffer.from(hash, 'hex');
      const keylen = hashBuffer.length;

      const derivedKey = await new Promise((resolve, reject) => {
        crypto.scrypt(plainPassword, salt, keylen, { N, r, p, maxmem: 64 * 1024 * 1024 }, (err, dk) => {
          if (err) return reject(err);
          resolve(dk);
        });
      });

      if (hashBuffer.length !== derivedKey.length) {
        isMatch = false;
      } else {
        isMatch = crypto.timingSafeEqual(hashBuffer, derivedKey);
      }
    } else {
      isMatch = await bcrypt.compare(plainPassword, storedPassword);
    }
    return isMatch;
};