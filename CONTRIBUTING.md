# Contributing to LinVault

Thanks for your interest in improving LinVault. This doc covers how to get set up locally, how the project is organised, and how to submit changes.

## Before you start

- For small fixes (typos, small bugs), feel free to just open a PR directly.
- For anything bigger — new features, schema changes, new Discord commands, or anything touching the AI classification — please open an issue first so we can agree on the approach before you put time into it.
- Check open issues and PRs first to avoid duplicate work.

## Project structure

LinVault has four parts, and a change usually touches just one:

| Folder | What it is |
|---|---|
| `frontend/` | React 19 + Vite web app |
| `backend/` | Express 5 API, PostgreSQL (via `pg`), and the Discord bot |
| `backend/bot/` | Discord bot: slash commands, auto-save-on-paste, scheduled digests |
| `extension/` | Chrome Extension (Manifest V3) |

See the "How the Code Works" section in the main [README](./README.md) for a file-by-file breakdown.

## Local setup

Follow the "Setup & Running Locally" section in the [README](./README.md#setup--running-locally). In short:

1. Create a free [Neon](https://neon.tech) Postgres database and run the schema in the README.
2. `cd backend && npm install`, add a `.env` (see README for required vars), then `node server.js`.
3. `cd frontend && npm install`, add `frontend/.env` with `VITE_API_URL`, then `npm run dev`.
4. For the extension: load `extension/` unpacked at `chrome://extensions`.

You don't need a Discord bot token or Groq key to work on the frontend — only the backend/bot pieces need those. If you're only touching frontend code, you can point `VITE_API_URL` at the deployed Render API instead of running the backend locally.

## Making changes

- Create a branch off `main`: `git checkout -b fix/short-description` or `feat/short-description`.
- Keep PRs focused — one fix or feature per PR is much easier to review than a bundle of unrelated changes.
- Match the existing code style in the file you're editing (this project doesn't currently enforce Prettier, so just stay consistent with what's around your change).
- Run `npm run lint` in `frontend/` before submitting if you touched frontend code.
- If you change the database schema, include the `ALTER TABLE` / `CREATE TABLE` statements in your PR description so others can update their local DB.
- If you add a new Discord slash command, update `backend/bot/registerCommands.js` and add it to the command table in the README.

## Commit messages

Short, present-tense, descriptive. No strict convention enforced, but something like:

```
fix: correct tag autocomplete matching case
feat: add favicon fetching on link save
docs: update env var table
```

## Submitting a pull request

1. Push your branch and open a PR against `main`.
2. Describe **what** changed and **why** — screenshots or a short clip are appreciated for UI changes.
3. Link any related issue (`Closes #12`).
4. Be ready for review comments — most PRs need at least one round of feedback.

## Reporting bugs / requesting features

Please use the issue templates under `.github/ISSUE_TEMPLATE/` — they ask for the info needed to reproduce or evaluate the request.

## Code of Conduct

This project follows the [Code of Conduct](./CODE_OF_CONDUCT.md). Please read it before participating.

## Questions

If anything here is unclear, open an issue with the `question` label — happy to help.
