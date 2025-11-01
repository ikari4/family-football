// /api/get-games.js
// Returns all games of the current NFL week from the table Games_2025_26

import { createClient } from "@libsql/client";

export default async function handler(req, res) {
  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const today = new Date().toISOString();

    const result = await db.execute({
      sql: `
        SELECT dk_game_id, home_team, away_team, spread, nfl_week, game_date
        FROM Games_2025_26
        WHERE game_date >= ?
        ORDER BY game_date
      `,
      args: [today]
    });

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Database fetch error:", err);
    res.status(500).json({ error: "Failed to fetch games" });
  }
}