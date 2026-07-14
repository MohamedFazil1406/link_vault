# Deployment Guide

## Prerequisites

- Node.js 18+ and npm/pnpm
- A Vercel account (recommended) or any Node.js hosting platform

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | Secret for NextAuth.js | Yes |
| `NEXTAUTH_URL` | Base URL of your deployment | Yes |

## Deploying to Vercel

1. Fork this repository
2. Import the project in [Vercel](https://vercel.com)
3. Configure environment variables
4. Deploy

## Deploying with Docker

```bash
docker build -t link-vault .
docker run -p 3000:3000 --env-file .env link-vault
```

## Database Setup

```bash
npx prisma migrate deploy
```
