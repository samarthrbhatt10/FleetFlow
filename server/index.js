import express from 'express';
import cors from 'cors';
import { initDB } from './db.js';
import routes from './routes.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', routes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server after DB init
initDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n  🚀 FleetFlow API Server running on http://localhost:${PORT}`);
        console.log(`  📦 SQLite database initialized`);
        console.log(`  📝 API endpoints available at /api/*\n`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
});
