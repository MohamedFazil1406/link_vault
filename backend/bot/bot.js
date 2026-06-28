import { Client, GatewayIntentBits, Events } from 'discord.js';
import pool from '../data/db.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ── Batching ──────────────────────────────────────────────────────────────────
const batchMap = new Map();

function scheduleFlush(channelId, channel) {
  const entry = batchMap.get(channelId);
  if (entry.timer) clearTimeout(entry.timer);
  entry.timer = setTimeout(() => flushBatch(channelId, channel), 2000);
}

async function flushBatch(channelId, channel) {
  const entry = batchMap.get(channelId);
  if (!entry || entry.urls.length === 0) return;
  const urls = [...entry.urls];
  batchMap.delete(channelId);

  channel.send(`⏳ Got **${urls.length}** link${urls.length > 1 ? 's' : ''}. Classifying...`);

  const results = await Promise.allSettled(urls.map(url => classifyAndSave(url, null, [])));
  const saved = results.filter(r => r.status === 'fulfilled' && r.value && !r.value.duplicate).map(r => r.value);
  const dupes = results.filter(r => r.status === 'fulfilled' && r.value?.duplicate).length;
  const failed = results.filter(r => r.status === 'rejected').length;

  if (saved.length > 0) {
    const lines = saved.map(l => `• **${l.name}** → \`${l.url}\``).join('\n');
    channel.send(`✅ Saved ${saved.length} link${saved.length > 1 ? 's' : ''} to **Unsorted**:\n${lines}`);
  }
  if (dupes > 0) channel.send(`⚠️ ${dupes} link${dupes > 1 ? 's were' : ' was'} already in your vault.`);
  if (failed > 0) channel.send(`❌ ${failed} link${failed > 1 ? 's' : ''} failed to save.`);
}

// ── URL extractor ─────────────────────────────────────────────────────────────
function extractUrls(text) {
  // Strip Discord markdown [text](url) → grab just the url
  text = text.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '$2');
  // If no protocol, try adding https://
  if (!text.match(/https?:\/\//i) && text.includes('.')) {
    text = 'https://' + text.trim();
  }
  const regex = /https?:\/\/[^\s<>"]+/gi;
  return [...new Set(text.match(regex) || [])];
}

// ── Groq classification ───────────────────────────────────────────────────────
async function classifyUrl(url) {
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      messages: [
        {
          role: 'system',
          content: 'You are a link classifier. Given a URL, return ONLY a JSON object with keys: "name" (short title max 6 words), "category" (one word: Video/Article/Tool/Repo/Podcast/Other), "tags" (array of 2-3 lowercase strings). No markdown, no explanation.',
        },
        { role: 'user', content: `Classify this URL: ${url}` },
      ],
      temperature: 0.2,
    }),
  });
  const data = await res.json();
  const text = data.choices?.[0]?.message?.content?.trim() || '{}';
  return JSON.parse(text);
}

// ── Save to DB ────────────────────────────────────────────────────────────────
async function classifyAndSave(url, collectionId, extraTags = []) {
  const existing = await pool.query('SELECT * FROM links WHERE url = $1', [url]);
  if (existing.rows.length > 0) return { ...existing.rows[0], duplicate: true };

  let name = url;
  let tags = [];
  try {
    const classification = await classifyUrl(url);
    name = classification.name || url;
    tags = classification.tags || [];
    if (classification.category) tags.unshift(classification.category.toLowerCase());
  } catch {
    try { name = new URL(url).hostname.replace('www.', ''); } catch {}
  }

  // Merge: domain tag + AI tags + user-supplied tags
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    tags = [...new Set([domain, ...tags, ...extraTags].filter(Boolean))];
  } catch {
    tags = [...new Set([...tags, ...extraTags].filter(Boolean))];
  }

  const id = Date.now() + Math.floor(Math.random() * 1000);
  const result = await pool.query(
    'INSERT INTO links (id, name, url, notes, collection_id, tags, created_at) VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING *',
    [id, name, url, '', collectionId, tags]
  );
  return result.rows[0];
}

// ── Auto-listen for pasted URLs in #linvault ──────────────────────────────────
const WATCHED_CHANNEL_NAME = 'linvault';

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.channel.name !== WATCHED_CHANNEL_NAME) return;
  if (message.content.startsWith('/')) return;

  const urls = extractUrls(message.content);
  if (urls.length === 0) return;

  if (!batchMap.has(message.channelId)) {
    batchMap.set(message.channelId, { urls: [], timer: null });
  }
  batchMap.get(message.channelId).urls.push(...urls);
  scheduleFlush(message.channelId, message.channel);
});

// ── Slash command interactions ────────────────────────────────────────────────
client.on(Events.InteractionCreate, async (interaction) => {
  // ── Autocomplete ────────────────────────────────────────────────────────────
  if (interaction.isAutocomplete()) {
    const focused = interaction.options.getFocused(true);

    if (focused.name === 'collection') {
      const search = focused.value.toLowerCase();
      try {
        const result = await pool.query('SELECT id, name FROM collections ORDER BY name ASC');
        const choices = result.rows
          .filter(c => c.name.toLowerCase().includes(search))
          .slice(0, 25)
          .map(c => ({ name: c.name, value: String(c.id) }));
        await interaction.respond(choices);
      } catch { await interaction.respond([]); }
    }

    if (focused.name === 'tags') {
      const search = focused.value.toLowerCase();
      try {
        // Pull all unique tags from existing links in DB
        const result = await pool.query(`
          SELECT DISTINCT unnest(tags) AS tag FROM links ORDER BY tag ASC
        `);
        const choices = result.rows
          .map(r => r.tag)
          .filter(t => t && t.toLowerCase().includes(search) && !t.includes('.'))
          .slice(0, 25)
          .map(t => ({ name: t, value: t }));
        await interaction.respond(choices);
      } catch { await interaction.respond([]); }
    }
    return;
  }

  if (!interaction.isChatInputCommand()) return;
  if (interaction.commandName !== 'save') return;

  await interaction.deferReply();

  const rawUrl = interaction.options.getString('url');
  const collectionId = interaction.options.getString('collection') || null;
  const tagInput = interaction.options.getString('tags') || '';

  const urls = extractUrls(rawUrl);
  if (urls.length === 0) {
    return interaction.editReply('❌ No valid URL found. Make sure it starts with https://');
  }

  // Parse tags: comma or space separated, plus autocomplete pick
  const extraTags = tagInput
    .split(/[,\s]+/)
    .map(t => t.trim().toLowerCase())
    .filter(Boolean);

  try {
    const link = await classifyAndSave(urls[0], collectionId, extraTags);

    if (link.duplicate) {
      return interaction.editReply(`⚠️ Already saved: **${link.name || link.url}**`);
    }

    let collectionName = 'Unsorted';
    if (collectionId) {
      const col = await pool.query('SELECT name FROM collections WHERE id = $1', [collectionId]);
      if (col.rows.length > 0) collectionName = col.rows[0].name;
    }

    const tagDisplay = link.tags?.filter(t => !t.includes('.')).join(', ') || 'none';
    interaction.editReply(
      `✅ Saved **${link.name}** to **${collectionName}**\n🏷️ Tags: ${tagDisplay}`
    );
  } catch (err) {
    console.error(err);
    interaction.editReply('❌ Failed to save link. Check server logs.');
  }
});

// ── Ready ─────────────────────────────────────────────────────────────────────
client.once(Events.ClientReady, (c) => {
  console.log(`✅ LinVault bot ready as ${c.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

export default client;
