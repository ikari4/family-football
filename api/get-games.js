// /api/get-games.js
// Returns either all games of the current NFL week 
// or those that haven't started depending on call

import { createClient } from "@libsql/client";

export default async function handler(req, res) {
  const {mode = "current"} = req.query;

  try {
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    const today = new Date();

    // Build UTC dates from US Eastern (handles DST correctly)
    function getEasternDateUTC(year, month, day, hourEastern) {
      const local = new Date(Date.UTC(year, month, day, hourEastern));
      const easternStr = local.toLocaleString("en-US", { timeZone: "America/New_York" });
      const easternDate = new Date(easternStr);
      const offsetMillis = easternDate.getTime() - local.getTime();

      return new Date(local.getTime() - offsetMillis);
    }

    // Build week ranges
    const nflWeeks = Array.from({ length: 18 }, (_, i) => {
      const week = i + 1;

      // Week 1 begins Tuesday Sept 2 2025 @ 3 AM Eastern (month 8 = September)
      const start = getEasternDateUTC(2025, 8, 2 + i * 7, 3);

      // End = 3 AM Eastern of the following Tuesday minus 1 ms
      const end = new Date(getEasternDateUTC(2025, 8, 2 + (i + 1) * 7, 3) - 1);

      return { week, start, end };
    });

    // Find the current week using UTC (server time)

    const currentWeek = nflWeeks.find(w => today >= w.start && today <= w.end);

    if (!currentWeek) {
      return res.status(400).json({ error: "Not within NFL season" });
    }

    let sql, args;
    if (mode === "current") {
      // Only games not yet started
      sql = `
        SELECT dk_game_id, home_team, away_team, spread, nfl_week, game_date
        FROM Games_2025_26
        WHERE nfl_week = ? AND game_date >= ?
        ORDER BY game_date ASC
      `;
      
      args = [currentWeek.week, today.toISOString()];
    } else if (mode === "week") {
      // All games for this week
      sql = `
        SELECT dk_game_id, home_team, away_team, spread, nfl_week, game_date
        FROM Games_2025_26
        WHERE nfl_week = ?
        ORDER BY game_date ASC
      `;
      args = [currentWeek.week];
    }

    const result = await db.execute({ sql, args });

    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Database fetch error:", err);
    res.status(500).json({ error: "Failed to fetch games" });
  }
}