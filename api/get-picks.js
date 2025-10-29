// /api/get-picks.js
import { createClient } from "@libsql/client";

export default async function handler(req, res) {
  const { player_id } = req.query;

  if (!player_id) {
    return res.status(400).json({ error: "player_id required" });
  }

  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    const result = await db.execute({
      sql: "SELECT dk_game_id, pick FROM Picks_2025_26 WHERE player_id = ?",
      args: [player_id],
    });

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}

