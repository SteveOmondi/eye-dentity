import dotenv from 'dotenv';
import path from 'path';

console.log('Resolving .env path...');
// Assuming we run from root or src, but __dirname is safe if built or run via tsx
const envPath = path.resolve(__dirname, '../../.env');
// src/config/env.ts -> ../../.env
// Wait, regex check: src/config -> src -> root. Yes.
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });
console.log('Env loaded. GEMINI:', !!process.env.GEMINI_API_KEY);
