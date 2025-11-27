// server/services/cryptoService.js
import crypto from 'crypto';
import 'dotenv/config';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// Derive a 32-byte key from the environment variable using a hash function.
// This is more robust than slicing or padding.
const keySource = process.env.CRYPTO_KEY;

if (!keySource) {
    console.error('FATAL: CRYPTO_KEY environment variable is not set. Encryption will be insecure. Please set a strong secret in your .env file.');
}

// Use SHA-256 to generate a consistent 32-byte key.
const ENCRYPTION_KEY = crypto.createHash('sha256').update(String(keySource || 'default-insecure-key-for-dev')).digest();

export const cryptoService = {
    encrypt(text) {
        if (!text) return text;
        try {
            const iv = crypto.randomBytes(IV_LENGTH);
            const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
            let encrypted = cipher.update(text);
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            return iv.toString('hex') + ':' + encrypted.toString('hex');
        } catch (error) {
            console.error('Encryption failed:', error);
            // Return original text on failure to avoid data loss, though it will be unencrypted.
            // With the new key derivation, this should ideally not be hit.
            return text;
        }
    },

    decrypt(text) {
        if (!text || typeof text !== 'string' || !text.includes(':')) {
            return text; // Not an encrypted string, or empty, return as is
        }
        try {
            const textParts = text.split(':');
            if (textParts.length < 2) return text; // Malformed encrypted string
            const iv = Buffer.from(textParts.shift(), 'hex');
            const encryptedText = Buffer.from(textParts.join(':'), 'hex');
            const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
            let decrypted = decipher.update(encryptedText);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return decrypted.toString();
        } catch (error) {
            console.error('Decryption failed for text:', text.substring(0, 10) + '...');
            // If decryption fails, it could be old unencrypted data or a key change.
            // It's safer to return the original (potentially unencrypted) text.
            return text;
        }
    }
};