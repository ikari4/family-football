// /api/login.js

import { createClient } from "@libsql/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, pw } = req.body;

  if (!email || !pw) {
    return res.status(400).json({ error: "Email and password required" });
  }

  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    const result = await db.execute({
      sql: "SELECT player_id, player_name, player_email, player_pw FROM Players WHERE player_email = ? LIMIT 1",
      args: [email]
    });

    const user = result.rows[0];
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (pw !== user.player_pw) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    delete user.player_pw;

    return res.status(200).json({ player: user });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
}
