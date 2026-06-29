# 🔒 LinVault

A full-stack link management app. Save URLs, organise them into collections, tag them automatically, search and filter across them — from the web app, Chrome Extension, Android share sheet, or directly from Discord.

[![Repo](https://img.shields.io/badge/GitHub-link_vault-black?logo=github)](https://github.com/zeena-taste/link_vault)
[![API](https://img.shields.io/badge/API-Render-blue?logo=render)](https://link-vault-p0sw.onrender.com)

---

## What's New — Discord Bot (v2)

LinVault now has a Discord bot for saving and managing links without opening the app.

### Auto-save by pasting
Drop any links into the `#linvault` channel — no command needed. The bot batches everything for 2 seconds, classifies each link using Groq AI, and saves them all to your vault automatically.

### AI classification
Every saved link gets a real name, category, tags, and a short summary in the notes field — powered by Groq (llama3). For YouTube links it fetches the real page title before classifying. For TikTok it uses the oEmbed API to get the actual video title.

### Slash commands

| Command | What it does |
|---|---|
| `/save <url>` | Save a link with optional collection and tags |
| `/find <term>` | Search your vault by name, URL, notes, or tag |
| `/recent` | Show your last 10 saved links |
| `/random` | Pull a random link from your vault |
| `/move <url> <collection>` | Move a link to a different collection |
| `/tag <url> <tags>` | Add tags to an existing link |
| `/unsave <url>` | Delete a link |
| `/collection <name>` | Show all links in a collection |
| `/stats` | Total links, collections, this week count, top tags |
| `/duplicate` | Find and auto-delete duplicate URLs, keeps newest |
| `/digest week` | AI summary of this week's links |
| `/digest month` | AI summary of this month's links |
| `/digest alltime` | AI summary of everything saved |
| `/digest pick month:June year:2025` | AI summary of any specific month |

### Automated digests
The bot posts automatically to `#linvault` with no input needed:
- **Every Monday at 9am** — weekly digest of links saved in the last 7 days
- **1st of every month at 9am** — monthly digest with collection breakdown and AI summary

Both run on Kigali time (UTC+2).

---

## Features

- Save links with a name, URL, notes, and tags
- Auto-tag links by domain on save
- Add custom tags manually and reuse existing ones
- Organise links into collections
- Filter by tag, domain, or date added (today / this week / this month)
- Search links by name
- Export all links as JSON
- Dark mode toggle — persists across sessions
- Chrome Extension — save from any page without opening the app
- Android share sheet — share any link directly into the app
- Discord bot — save, search, and manage links without leaving Discord

---

## How the Code Works

### Frontend (`/frontend`)
Built with React 19 and Vite. All state lives in `App.jsx` and flows down via props.

**`src/index.css`** — global design tokens as CSS variables. Dark mode is applied via `[data-theme="dark"]` on the `<html>` element and toggled from the sidebar. Theme preference is saved to `localStorage`.

**`src/api.js`** — every fetch call to the backend. Uses `import.meta.env.VITE_API_URL` so the backend URL is never hardcoded.

**`src/App.jsx`** — root component. Holds all state: links, collections, active filters, modal visibility, search term, dark mode. All handlers live here and get passed down as props.

**`src/components/`**
- `Header.jsx` — breadcrumb showing active collection, search input, filter toggle, add link button
- `sidebar.jsx` — navigation with hover-expand behaviour, dark mode toggle, collapses to a bottom bar on mobile
- `linklist.jsx` — link rows with favicon initial, inline tags, and action buttons that fade in on hover
- `FilterBar.jsx` — animated filter chips for date, domain, and tags. Only shows filters that have data
- `collectionPage.jsx` — card grid of collections with real link counts
- `addlinkbtn.jsx` — modal for adding or editing a link. Tag autocomplete from existing tags, collection picker, notes
- `addcollectionbtn.jsx` — modal for creating a new collection
- `ShareTarget.jsx` — standalone bottom sheet rendered when opened via Android share sheet

### Backend (`/backend`)
Node.js with Express 5 and ES Modules.

**`server.js`** — entry point. Imports the bot so it starts alongside the API server.

**`routes/links.js`** — all `/links` endpoints. Domain auto-tagged on POST. `normalize()` converts PostgreSQL BIGINT to JS numbers.

**`routes/collections.js`** — all `/collections` endpoints.

**`data/db.js`** — `pg` connection pool from `process.env.DATABASE_URL`.

### Discord Bot (`/backend/bot`)

**`bot.js`** — main bot file. Handles the URL batching window, auto-paste listener, all slash command interactions, and autocomplete for collections and tags.

**`digest.js`** — `generateDigest()` shared function used by both the `/digest` command and the scheduled cron jobs. Exports `scheduleWeeklyDigest` and `scheduleMonthlyDigest` which are started on bot ready.

**`registerCommands.js`** — run once locally to register slash commands with Discord. Uses guild commands for instant registration.

### Chrome Extension (`/extension`)
Manifest V3. Auto-fills the current tab's title and URL, loads collections from the backend, and POSTs the new link on save.

---

## Project Structure

```
link_vault/
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   ├── api.js
│   │   ├── main.jsx
│   │   └── components/
│   │       ├── Header.jsx
│   │       ├── sidebar.jsx
│   │       ├── linklist.jsx
│   │       ├── FilterBar.jsx
│   │       ├── collectionPage.jsx
│   │       ├── addlinkbtn.jsx
│   │       ├── addcollectionbtn.jsx
│   │       ├── ShareTarget.jsx
│   │       └── CSS/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── server.js
│   ├── routes/
│   │   ├── links.js
│   │   └── collections.js
│   ├── data/
│   │   └── db.js
│   ├── bot/
│   │   ├── bot.js
│   │   ├── digest.js
│   │   └── registerCommands.js
│   └── package.json
│
└── extension/
    ├── manifest.json
    ├── popup.html
    ├── popup.js
    └── style.css
```

---

## Setup & Running Locally

### Prerequisites
- Node.js v18+
- A Chromium-based browser for the extension
- A [Neon](https://neon.tech) free account for the database
- A [Groq](https://console.groq.com) free account for AI classification
- A Discord application and bot token from the [Discord Developer Portal](https://discord.com/developers/applications)

### 1. Database

Create a free project on [neon.tech](https://neon.tech), then run:

```sql
CREATE TABLE collections (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE links (
  id BIGINT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  notes TEXT DEFAULT '',
  collection_id BIGINT REFERENCES collections(id) ON DELETE SET NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```
DATABASE_URL=your-neon-connection-string
FRONTEND_URL=http://localhost:5173
PORT=5000
GROQ_API_KEY=your-groq-key
DISCORD_TOKEN=your-bot-token
DISCORD_CLIENT_ID=your-application-id
DISCORD_GUILD_ID=your-discord-server-id
```

```bash
node server.js
```

### 3. Register Discord slash commands (once)

```bash
node bot/registerCommands.js
```

Commands appear in your server instantly (guild-scoped).

### 4. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:
```
VITE_API_URL=http://localhost:5000
```

```bash
npm run dev
```

### 5. Chrome Extension

1. Open `chrome://extensions`
2. Enable **Developer Mode**
3. **Load unpacked** → select the `extension/` folder

---

## Environment Variables

### Backend
| Variable | Value |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `FRONTEND_URL` | Deployed frontend URL — used for CORS |
| `PORT` | Set automatically by Render, falls back to 5000 |
| `GROQ_API_KEY` | From [console.groq.com](https://console.groq.com) |
| `DISCORD_TOKEN` | Bot token from Discord Developer Portal |
| `DISCORD_CLIENT_ID` | Application ID from Discord Developer Portal |
| `DISCORD_GUILD_ID` | Right-click your server in Discord → Copy Server ID |

### Frontend
| Variable | Value |
|---|---|
| `VITE_API_URL` | `http://localhost:5000` locally, Render URL in production |

---

## Deployment

### Database → Neon
Free hosted PostgreSQL. Data persists independently of server restarts.

### Backend → Render
1. Push to GitHub
2. Render → New Web Service → connect repo → Root Directory: `backend`
3. Build: `npm install` — Start: `npm start`
4. Add all backend environment variables in the Render dashboard
5. Enable **Auto-Deploy**

The Discord bot starts automatically alongside the Express server.

### Frontend → Vercel
1. Vercel → New Project → Root Directory: `frontend`
2. Framework: Vite — Build: `npm run build` — Output: `dist`
3. Add `VITE_API_URL` = your Render URL
4. Deploy

> Vite bakes env vars at build time. Updating `VITE_API_URL` requires a redeploy.

### Extension (production)
Update `API_URL` in `popup.js` to your Render URL, then reload in `chrome://extensions`.

---

## Roadmap

- [ ] Read later / reminders — flag links with an optional remind date
- [ ] Favicon fetching — auto-grab the site icon for each link
- [ ] Link health checker — flag broken or redirected URLs
- [ ] User authentication — multi-user support with Auth0 or Clerk
- [ ] Full-text search — extend search to URLs and notes
- [x] Discord bot — save and manage links from Discord
- [x] AI classification — auto name, tag, and summarise every saved link
- [x] Automated digests — weekly and monthly AI summaries posted to Discord
- [x] Dark mode
- [x] Android share sheet

---

## Contributing

Contributions are welcome. Fork the repo, create a branch, and open a pull request.
