// Aggregate of every feature's tables, so the Drizzle client knows all of them.
// The only place in infra/ allowed to import from modules/: it re-exports table
// definitions and contains no logic.
export * from '../../modules/auth/auth.schema.js';
