import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pkg;

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// PostgreSQL connection pool (update with your Render DB credentials)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/etpsplanner',
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

// --- Run schema.sql to initialize DB ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
async function runSchema() {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  await pool.query(schema);
}

app.head('/', (req, res) => {
  res.status(200).end();
});

app.get('/', (req, res) => {
  res.json({ message: 'ETPS Planner API running!' });
});

// Get all tiles
app.get('/tiles', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tiles ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new tile
app.post('/tiles', async (req, res) => {
  const { aircraft, takeoff, landing, captain, others, fuel, fti, notes } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO tiles (aircraft, takeoff, landing, captain, others, fuel, fti, notes) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [aircraft, takeoff, landing, captain, others, fuel, fti, notes]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a tile
app.put('/tiles/:id', async (req, res) => {
  const { id } = req.params;
  const { aircraft, takeoff, landing, captain, others, fuel, fti, notes } = req.body;
  try {
    const result = await pool.query(
      'UPDATE tiles SET aircraft=$1, takeoff=$2, landing=$3, captain=$4, others=$5, fuel=$6, fti=$7, notes=$8 WHERE id=$9 RETURNING *',
      [aircraft, takeoff, landing, captain, others, fuel, fti, notes, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tile not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a tile
app.delete('/tiles/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM tiles WHERE id=$1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Tile not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server after DB schema is initialized
runSchema().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
}); 