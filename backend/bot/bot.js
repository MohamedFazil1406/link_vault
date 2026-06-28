import { Client, GatewayIntentBits, Events } from 'discord.js';
import pool from '../data/db.js';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// ── Batching: collect URLs per channel for 2s then flush ──────────────────────
const batchMap = new Map(); // channelId → { urls: [], timer }

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

  const results = await Promise.allSettled(urls.map(url => classifyAndSave(url, null)));

  const saved = results.filter(r => r.status === 'fulfilled' && r.value).map(r => r.value);
  const failed = results.filter(r => r.status === 'rejected' || !r.value).length;

  if (saved.length > 0) {
    const lines = saved.map(l => `• **${l.name}** → \`${l.url}\``).join('\n');
    channel.send(`✅ Saved ${saved.length} link${saved.length > 1 ? 's' : ''} to **Unsorted**:\n${lines}`);
  }
  if (failed > 0) {
    channel.send(`⚠️ ${failed} link${failed > 1 ? 's' : ''} failed to save.`);
  }
}

// ── URL extractor ─────────────────────────────────────────────────────────────
function extractUrls(text) {
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
          content:
            'You are a link classifier. Given a URL, return ONLY a JSON object with keys: "name" (short title, max 6 words), "category" (one word like Video/Article/Tool/Repo/Podcast/Other), "tags" (array of 2-3 lowercase strings). No markdown, no explanation.',
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

// ── Save link to DB ───────────────────────────────────────────────────────────
async function classifyAndSave(url, collectionId) {
  // Check duplicate
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
    // Groq failed — save with domain as name
    try { name = new URL(url).hostname.replace('www.', ''); } catch {}
  }

  // Auto-add domain tag
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    tags = [...new Set([domain, ...tags].filter(Boolean))];
  } catch {}

  const id = Date.now() + Math.floor(Math.random() * 1000);
  const result = await pool.query(
    'INSERT INTO links (id, name, url, notes, collection_id, tags, created_at) VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING *',
    [id, name, url, '', collectionId, tags]
  );
  return result.rows[0];
}

// ── Listen for messages with URLs (auto-batch) ────────────────────────────────
const WATCHED_CHANNEL_NAME = 'linvault'; // change to your channel name

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (message.channel.name !== WATCHED_CHANNEL_NAME) return;
  if (message.content.startsWith('/')) return; // handled by slash commands

  const urls = extractUrls(message.content);
  if (urls.length === 0) return;

  if (!batchMap.has(message.channelId)) {
    batchMap.set(message.channelId, { urls: [], timer: null });
  }
  const entry = batchMap.get(message.channelId);
  entry.urls.push(...urls);
  scheduleFlush(message.channelId, message.channel);
});

// ── Slash command: /save ──────────────────────────────────────────────────────
client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand() && !interaction.isAutocomplete()) return;

  // Autocomplete for collection field
  if (interaction.isAutocomplete()) {
    const focused = interaction.options.getFocused().toLowerCase();
    try {
      const result = await pool.query('SELECT id, name FROM collections ORDER BY name ASC');
      const choices = result.rows
        .filter(c => c.name.toLowerCase().includes(focused))
        .slice(0, 25)
        .map(c => ({ name: c.name, value: String(c.id) }));
      await interaction.respond(choices);
    } catch {
      await interaction.respond([]);
    }
    return;
  }

  if (interaction.commandName !== 'save') return;

  await interaction.deferReply();

  const url = interaction.options.getString('url');
  const collectionId = interaction.options.getString('collection') || null;

  const urls = extractUrls(url);
  if (urls.length === 0) {
    return interaction.editReply('❌ No valid URL found.');
  }

  try {
    const link = await classifyAndSave(urls[0], collectionId);
    if (link.duplicate) {
      return interaction.editReply(`⚠️ Already saved: **${link.name}**`);
    }

    let collectionName = 'Unsorted';
    if (collectionId) {
      const col = await pool.query('SELECT name FROM collections WHERE id = $1', [collectionId]);
      if (col.rows.length > 0) collectionName = col.rows[0].name;
    }

    interaction.editReply(`✅ Saved **${link.name}** to **${collectionName}**\nTags: ${link.tags?.join(', ') || 'none'}`);
  } catch (err) {
    console.error(err);
    interaction.editReply('❌ Failed to save link.');
  }
});

// ── Ready ─────────────────────────────────────────────────────────────────────
client.once(Events.ClientReady, (c) => {
  console.log(`✅ LinVault bot ready as ${c.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);

export default client;
