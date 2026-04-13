import express from 'express';
import pool from '../data/db.js';

const router = express.Router();

// normalize: convert BigInt IDs to numbers, ensure tags is always an array
function normalize(row) {
  return {
    ...row,
    id: Number(row.id),
    collection_id: row.collection_id ? Number(row.collection_id) : null,
    collectionId: row.collection_id ? Number(row.collection_id) : null,
    tags: row.tags || [],
  };
}

// GET all links
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM links ORDER BY id DESC');
    res.json(result.rows.map(normalize));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to read links" });
  }
});

// GET unassigned — MUST be before /:id
router.get('/unassigned', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM links WHERE collection_id IS NULL ORDER BY id DESC');
    res.json(result.rows.map(normalize));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch unassigned links" });
  }
});

// GET links by collection — MUST be before /:id
router.get('/collection/:id', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM links WHERE collection_id = $1 ORDER BY id DESC',
      [req.params.id]
    );
    res.json(result.rows.map(normalize));
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch links by collection" });
  }
});

// GET link by ID
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM links WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Link not found' });
    res.json(normalize(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: "Failed to read link" });
  }
});

// POST add new link
router.post('/', async (req, res) => {
  try {
    const { name, url, notes = '', collectionId = null, tags = [] } = req.body;

    // check for duplicate URL
    const existing = await pool.query('SELECT * FROM links WHERE url = $1', [url]);
    if (existing.rows.length > 0) {
      return res.status(200).json({ ...normalize(existing.rows[0]), duplicate: true });
    }

    const id = Date.now();

    // auto-tag by domain
    let domain = '';
    try { domain = new URL(url).hostname.replace('www.', ''); } catch { domain = ''; }

    // merge domain tag with custom tags, remove duplicates
    const allTags = [...new Set([domain, ...tags].filter(Boolean))];

    const result = await pool.query(
      'INSERT INTO links (id, name, url, notes, collection_id, tags, created_at) VALUES ($1, $2, $3, $4, $5, $6, NOW()) RETURNING *',
      [id, name, url, notes, collectionId, allTags]
    );
    res.status(201).json(normalize(result.rows[0]));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add link" });
  }
});

// PUT update link
router.put('/:id', async (req, res) => {
  try {
    const { name, url, notes, collectionId, tags } = req.body;

    // if url is being updated, recalculate domain tag
    let updatedTags = tags ?? null;
    if (url && tags) {
      let domain = '';
      try { domain = new URL(url).hostname.replace('www.', ''); } catch { domain = ''; }
      updatedTags = [...new Set([domain, ...tags].filter(Boolean))];
    }

    const result = await pool.query(
      `UPDATE links SET
        name = COALESCE($1, name),
        url = COALESCE($2, url),
        notes = COALESCE($3, notes),
        collection_id = COALESCE($4, collection_id),
        tags = COALESCE($5, tags)
       WHERE id = $6 RETURNING *`,
      [name, url, notes, collectionId, updatedTags, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Link not found" });
    res.json(normalize(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: "Failed to update link" });
  }
});

// DELETE link
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM links WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Link not found" });
    res.json(normalize(result.rows[0]));
  } catch (err) {
    res.status(500).json({ error: "Failed to delete link" });
  }
});

export default router;
