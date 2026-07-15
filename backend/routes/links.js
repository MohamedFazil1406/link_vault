import express from 'express';
import pool from '../data/db.js';
import {
  ValidationError,
  parseId,
  requireNonEmptyString,
  optionalString,
  requireValidUrl,
  optionalId,
  optionalStringArray,
} from '../utils/validate.js';

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
    const collectionId = parseId(req.params.id, 'collection id');
    const result = await pool.query(
      'SELECT * FROM links WHERE collection_id = $1 ORDER BY id DESC',
      [collectionId]
    );
    res.json(result.rows.map(normalize));
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: "Failed to fetch links by collection" });
  }
});

// GET link by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const result = await pool.query('SELECT * FROM links WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Link not found' });
    res.json(normalize(result.rows[0]));
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: "Failed to read link" });
  }
});

// POST add new link
router.post('/', async (req, res) => {
  try {
    const name = requireNonEmptyString(req.body.name, 'name');
    const url = requireValidUrl(req.body.url, 'url');
    const notes = optionalString(req.body.notes, 'notes');
    const collectionId = optionalId(req.body.collectionId, 'collectionId');
    const tags = optionalStringArray(req.body.tags, 'tags');

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
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
    console.error(err);
    res.status(500).json({ error: "Failed to add link" });
  }
});

// PUT update link
router.put('/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);

    // Every field here is optional on update — but if present, it must be
    // valid. COALESCE in the query keeps whatever wasn't sent unchanged.
    const name = req.body.name !== undefined
      ? requireNonEmptyString(req.body.name, 'name')
      : null;
    const url = req.body.url !== undefined
      ? requireValidUrl(req.body.url, 'url')
      : null;
    const notes = req.body.notes !== undefined
      ? optionalString(req.body.notes, 'notes')
      : null;
    const collectionId = req.body.collectionId !== undefined
      ? optionalId(req.body.collectionId, 'collectionId')
      : null;
    const tags = req.body.tags !== undefined
      ? optionalStringArray(req.body.tags, 'tags')
      : null;

    // if url is being updated alongside tags, recalculate domain tag
    let updatedTags = tags;
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
      [name, url, notes, collectionId, updatedTags, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "Link not found" });
    res.json(normalize(result.rows[0]));
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: "Failed to update link" });
  }
});

// DELETE bulk links
router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids array is required" });
    }
    // ::bigint[] ensures the JS array matches your database's BigInt ID type
    const result = await pool.query('DELETE FROM links WHERE id = ANY($1::bigint[]) RETURNING *', [ids]);
    res.json({ deleted: result.rowCount, rows: result.rows.map(normalize) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to bulk delete links" });
  }
});

// PATCH bulk archive
router.patch('/bulk/archive', async (req, res) => {
  try {
    const { ids, archived = true } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: "ids array is required" });
    }
    const result = await pool.query(
      'UPDATE links SET archived = $1 WHERE id = ANY($2::bigint[]) RETURNING *', 
      [archived, ids]
    );
    res.json({ updated: result.rowCount, rows: result.rows.map(normalize) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to bulk archive links" });
  }
});

// PATCH bulk tag
router.patch('/bulk/tag', async (req, res) => {
  try {
    const { ids, tag } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !tag) {
      return res.status(400).json({ error: "ids array and tag are required" });
    }
    // This PG query appends the tag to the array, but ONLY if the tag doesn't already exist in it.
    // It handles null/empty tags gracefully using COALESCE.
    const result = await pool.query(
      `UPDATE links 
       SET tags = COALESCE(tags, '{}'::text[]) || $2 
       WHERE id = ANY($1::bigint[]) 
       AND NOT ($2 = ANY(COALESCE(tags, '{}'::text[]))) 
       RETURNING *`,
      [ids, tag]
    );
    res.json({ updated: result.rowCount, rows: result.rows.map(normalize) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to bulk tag links" });
  }
});

// DELETE link
router.delete('/:id', async (req, res) => {
  try {
    const id = parseId(req.params.id);
    const result = await pool.query('DELETE FROM links WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: "Link not found" });
    res.json(normalize(result.rows[0]));
  } catch (err) {
    if (err instanceof ValidationError) return res.status(400).json({ error: err.message });
    res.status(500).json({ error: "Failed to delete link" });
  }
});

export default router;
