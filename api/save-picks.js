// /api/save-picks.js

import { createClient } from "@libsql/client";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  try {
    const { picks } = req.body;

    if (!Array.isArray(picks)) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    // Hard-coded until we add player selection
    // const playerId = 1;

    for (const { pick, player_id } of picks) {
      await db.execute({
        sql: `
          INSERT INTO Picks_2025_26 (player_id, dk_game_id, pick)
          VALUES (?, ?, ?)
          ON CONFLICT(player_id, dk_game_id) DO UPDATE SET
            pick = excluded.pick,
            created_at = CURRENT_TIMESTAMP;
        `,
        args: [player_id, pick.dk_game_id, pick.pick]
      });
    }

    res.status(200).json({ message: "Picks saved!", count: picks.length });

  } catch (error) {
    console.error("Save picks error:", error);
    res.status(500).json({ error: "Server error" });
  }
}
