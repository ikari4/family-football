// Code from signup project. Must be changed!

// api/signup.js
import { createClient } from "@libsql/client";

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Simple validation helper
const isValidString = (s) => typeof s === 'string' && s.trim().length > 0;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Only POST allowed' });
    return;
  }

  const { firstName, lastName, age } = req.body || {};

  if (!isValidString(firstName) || !isValidString(lastName) || typeof age !== 'number' || age < 0) {
    res.status(400).json({ error: 'Invalid input' });
    return;
  }

  try {
    // Parameterized query to prevent injection
    await turso.execute({
      sql: `INSERT INTO users (first_name, last_name, age) VALUES (?, ?, ?)`,
      args: [firstName.trim(), lastName.trim(), age],
    });

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('DB error', err);
    res.status(500).json({ error: 'Server error' });
  }
}
