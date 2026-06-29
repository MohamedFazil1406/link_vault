import cron from 'node-cron';
import pool from '../data/db.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(date) {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

async function fetchLinksInRange(from, to) {
  const result = await pool.query(
    `SELECT l.*, c.name AS collection_name
     FROM links l
     LEFT JOIN collections c ON l.collection_id = c.id
     WHERE l.created_at >= $1 AND l.created_at < $2
     ORDER BY l.created_at DESC`,
    [from, to]
  );
  return result.rows;
}

async function getChannel(client) {
  const channel = client.channels.cache.find(ch => ch.name === 'linvault');
  if (!channel) console.warn('⚠️ Digest: #linvault channel not found');
  return channel;
}

// ── Groq digest generator ─────────────────────────────────────────────────────

async function generateDigest(links, period) {
  if (links.length === 0) return null;

  const linkSummaries = links.map(l =>
    `- "${l.name}" (${l.url}) tags: ${(l.tags || []).filter(t => !t.includes('.')).join(', ') || 'none'}${l.notes ? ` | note: ${l.notes}` : ''}`
  ).join('\n');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'llama3-8b-8192',
      max_tokens: 800,
      messages: [
        {
          role: 'system',
          content: `You are a personal knowledge assistant. Given a list of saved links, write a concise ${period} digest for the user.
Format it as Discord markdown. Group links by category (Videos, Articles, Tools, Repos, Other). 
For each link write one short line — what it is and why it might be useful.
End with one sentence observation about what topics the user was most interested in this ${period}.
Be direct and useful, not fluffy. No intro paragraph, go straight into the groups.`,
        },
        {
          role: 'user',
          content: `Here are the links saved this ${period}:\n${linkSummaries}`,
        },
      ],
      temperature: 0.4,
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content?.trim() || null;
}

// ── Weekly digest — every Monday at 9am UTC+2 (7am UTC) ──────────────────────

export function scheduleWeeklyDigest(client) {
  // 7am UTC = 9am Kigali (UTC+2), every Monday
  cron.schedule('0 7 * * 1', async () => {
    console.log('📊 Running weekly digest...');
    try {
      const now   = new Date();
      const to    = new Date(now);
      const from  = new Date(now);
      from.setDate(from.getDate() - 7);

      const links = await fetchLinksInRange(from, to);
      const channel = await getChannel(client);
      if (!channel) return;

      if (links.length === 0) {
        channel.send(`📭 **Weekly Digest** — no links saved this week. Get saving!`);
        return;
      }

      const digest = await generateDigest(links, 'week');
      const header = `📊 **Weekly LinVault Digest** — ${formatDate(from)} to ${formatDate(to)}\nYou saved **${links.length} link${links.length !== 1 ? 's' : ''}** this week.\n\n`;

      channel.send(header + (digest || 'Could not generate summary — but your links are saved!'));
    } catch (err) {
      console.error('Weekly digest error:', err);
    }
  }, { timezone: 'Africa/Kigali' });

  console.log('✅ Weekly digest scheduled — Mondays at 9am Kigali time');
}

// ── Monthly digest — 1st of every month at 9am UTC+2 ────────────────────────

export function scheduleMonthlyDigest(client) {
  cron.schedule('0 7 1 * *', async () => {
    console.log('📊 Running monthly digest...');
    try {
      const now  = new Date();
      const to   = new Date(now.getFullYear(), now.getMonth(), 1); // start of this month
      const from = new Date(now.getFullYear(), now.getMonth() - 1, 1); // start of last month

      const links = await fetchLinksInRange(from, to);
      const channel = await getChannel(client);
      if (!channel) return;

      if (links.length === 0) {
        channel.send(`📭 **Monthly Digest** — nothing saved last month.`);
        return;
      }

      const digest = await generateDigest(links, 'month');

      // Build collection breakdown
      const byCollection = {};
      for (const l of links) {
        const name = l.collection_name || 'Unsorted';
        byCollection[name] = (byCollection[name] || 0) + 1;
      }
      const collectionLines = Object.entries(byCollection)
        .sort((a, b) => b[1] - a[1])
        .map(([name, count]) => `  • ${name}: ${count} link${count !== 1 ? 's' : ''}`)
        .join('\n');

      const monthName = from.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
      const header = `📅 **Monthly LinVault Digest — ${monthName}**\nYou saved **${links.length} links** across these collections:\n${collectionLines}\n\n`;

      channel.send(header + (digest || 'Could not generate summary — but your links are saved!'));
    } catch (err) {
      console.error('Monthly digest error:', err);
    }
  }, { timezone: 'Africa/Kigali' });

  console.log('✅ Monthly digest scheduled — 1st of each month at 9am Kigali time');
}
