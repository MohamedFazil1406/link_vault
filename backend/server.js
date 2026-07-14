<<<<<<< HEAD
import 'dotenv/config';  // Load environment variables from .env file
import express from 'express';
import cors from 'cors';
import collectionRoute from './routes/collections.js';
import linkRoute from './routes/links.js';
import './bot/bot.js';
import {readLimiter,writeLimiter} from './middleware/rateLimiter.js';
=======
import "dotenv/config"; // Load environment variables from .env file
import express from "express";
import cors from "cors";
import collectionRoute from "./routes/collections.js";
import linkRoute from "./routes/links.js";
import { scheduleLinkHealthCheck } from "./bot/linkHealth.js";
import "./bot/bot.js";
>>>>>>> 9cc936f (feat: add scheduled link health checker)

const app = express();
app.set('trust proxy', 1);

function methodBasedRateLimiter(req, res, next) {
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return readLimiter(req, res, next);

  }

    return writeLimiter(req, res, next);
}

// Allowed origins: local dev + your future Vercel frontend URL
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL,
].filter(Boolean); // removes undefined if env var isn't set

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman, Chrome Extension)
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.startsWith("chrome-extension://")
      ) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
  }),
);

app.use(methodBasedRateLimiter);  // Apply rate limiting middleware to all routes

app.use(express.json());
app.use("/collections", collectionRoute);
app.use("/links", linkRoute);

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

const PORT = process.env.PORT || 5000; // Render sets PORT automatically
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
<<<<<<< HEAD
});
=======

  scheduleLinkHealthCheck();
});
>>>>>>> 9cc936f (feat: add scheduled link health checker)
