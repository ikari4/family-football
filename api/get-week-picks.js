// /api/get-week-picks.js

import { createClient } from "@libsql/client";

export default async function handler(req, res) {
  try {
    const { nfl_week } = req.query;
    if (!nfl_week) {
      return res.status(400).json({ error: "Missing nfl_week" });
    }

    // connect to Turso
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Get all games for the week
    const gamesRes = await db.execute({
      sql: `
        SELECT dk_game_id, home_team, away_team, spread, home_score, away_score, winning_team
        FROM Games_2025_26
        WHERE nfl_week = ?
        ORDER BY commence_time ASC;
      `,
      args: [nfl_week],
    });

    const games = gamesRes.rows;

    if (games.length === 0) {
      return res.status(200).json([]);
    }

    // Get all player picks for this week
    const picksRes = await db.execute({
      sql: `
        SELECT p.dk_game_id, pl.player_id, p.pick
        FROM Picks_2025_26 p
        JOIN Players pl ON p.player_email = pl.player_email
        WHERE p.nfl_week = ?;
      `,
      args: [nfl_week],
    });

    const allPicks = picksRes.rows;

    // Combine games and picks
    const gamesWithPicks = games.map(g => {
      const gamePicks = allPicks
        .filter(p => p.dk_game_id === g.dk_game_id)
        .reduce((acc, cur) => {
          acc[cur.player_id] = cur.pick;
          return acc;
        }, {});

      return {
        ...g,
        picks: gamePicks,
      };
    });

    res.status(200).json(gamesWithPicks);

  } catch (err) {
    console.error("Error in get-week-picks:", err);
    res.status(500).json({ error: "Server error loading week picks" });
  }
}
