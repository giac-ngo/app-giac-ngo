// server/index.js
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure dotenv to look for the .env file in the project root
dotenv.config({ path: path.resolve(__dirname, '..', '.env') });


// Force development mode if not explicitly set to production to prevent server crash
if (process.env.NODE_ENV !== 'production') {
  process.env.NODE_ENV = 'development';
}

import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import apiRoutes from './routes/index.js'; // Import the main router

const app = express();
const port = process.env.PORT || 3002;

const projectRoot = path.resolve(__dirname, '..');
const uploadsDir = path.join(projectRoot, 'uploads');
fs.mkdir(uploadsDir, { recursive: true });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/uploads', express.static(uploadsDir));

// --- API Routes ---
// Mount all API routes under the /api path
app.use('/api', apiRoutes);


// --- Static file serving & fallback for React Router ---
// This should come AFTER API routes but BEFORE app.listen
const publicPath = path.join(projectRoot, 'dist');
app.use(express.static(publicPath));

app.get('*', (req, res, next) => {
    // If the request is for an API route, let it pass to the 404 handler
    if (req.path.startsWith('/api/')) {
        return next();
    }
    // Otherwise, serve the main index.html for any non-API route.
    // This lets React Router handle the routing on the client side.
    res.sendFile(path.join(publicPath, 'index.html'));
});


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});