// Small, dependency-free validation helpers shared by the route files.
// Each `isX` returns a boolean. `parseId` / `requireX` throw a ValidationError
// that the route can catch and turn into a clean 400 response.

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

// Route params (e.g. :id) arrive as strings — make sure they're really a
// positive integer before they ever reach a SQL query.
export function parseId(rawId, label = 'id') {
  if (rawId === undefined || rawId === null || rawId === '') {
    throw new ValidationError(`${label} is required`);
  }
  if (!/^\d+$/.test(String(rawId))) {
    throw new ValidationError(`${label} must be a positive integer`);
  }
  return rawId;
}

export function requireNonEmptyString(value, field) {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${field} is required and must be a non-empty string`);
  }
  return value.trim();
}

export function optionalString(value, field, { defaultValue = '' } = {}) {
  if (value === undefined || value === null) return defaultValue;
  if (typeof value !== 'string') {
    throw new ValidationError(`${field} must be a string`);
  }
  return value;
}

export function requireValidUrl(value, field = 'url') {
  const str = requireNonEmptyString(value, field);
  try {
    new URL(str);
  } catch {
    throw new ValidationError(`${field} must be a valid URL (including http:// or https://)`);
  }
  return str;
}

export function optionalId(value, field) {
  if (value === undefined || value === null || value === '') return null;
  if (!/^\d+$/.test(String(value))) {
    throw new ValidationError(`${field} must be a positive integer`);
  }
  return value;
}

export function optionalStringArray(value, field) {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || !value.every((t) => typeof t === 'string')) {
    throw new ValidationError(`${field} must be an array of strings`);
  }
  return value;
}
