import ratelimit from "express-rate-limit";


const WINDOW_MS = 60 * 1000;
const readLimiter = ratelimit({
    windowMs : WINDOW_MS, // 1 minute
    max: 120, // limit each IP to 120 requests per windowMs
    message: "Too many requests. Please try again later.",
})

const writeLimiter = ratelimit({
    windowMs : WINDOW_MS, // 1 minute
    max: 30, // limit each IP to 30 requests per windowMs
    message: "Too many requests. Please try again later.",
})

export { readLimiter, writeLimiter };