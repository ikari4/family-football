// /api/get-week-picks.js
// Displays all picks in a table

import { createClient } from "@libsql/client";

export default async function handler(req, res) {
  try {
    const { nfl_week, player_id } = req.query;
    if (!nfl_week) {
      return res.status(400).json({ error: "Missing nfl_week" });
    }

    const weekNum = parseInt(nfl_week, 10);
    if (isNaN(weekNum)) {
      return res.status(400).json({ error: "Invalid nfl_week" });
    }

    // Connect to Turso
    const db = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });

    // Get this player's team
    const teamRes = await db.execute({
      sql: `SELECT team FROM Players WHERE player_id = ?;`,
      args: [player_id],
    });
    const team = teamRes.rows[0]?.team;
    
// 
console.log(team);
// 

    if (!team) {
      return res.status(400).json({ error: "Player has no assigned team" });
    }

    // Get all teammates on this team
    const teammatesRes = await db.execute({
      sql: `SELECT player_id FROM Players WHERE team = ?;`,
      args: [team],
    });
    const teammateIds = teammatesRes.rows.map(r => r.player_id);

// 
console.log(teammateIds);
// 

    // Count how many games are in this week
    const gamesRes = await db.execute({
      sql: `SELECT dk_game_id FROM Games_2025_26 WHERE nfl_week = ?;`,
      args: [nfl_week],
    });
    const gameCount = gamesRes.rows.length;

//
console.log(gameCount);
//  


    // Count how many picks each teammate has made for this week
    const picksCountRes = await db.execute({
      sql: `
        SELECT player_id, COUNT(*) as picks_made
        FROM Picks_2025_26
        WHERE nfl_week = ?
          AND player_id IN (${teammateIds.map(() => '?').join(',')})
        GROUP BY player_id;
      `,
      args: [nfl_week, ...teammateIds],
    });

    // Check if all teammates have full picks
    const allSubmitted = picksCountRes.rows.every(r => r.picks_made === gameCount);

//
console.log(allSubmitted); 


    if (!allSubmitted) {
      return res.status(200).json({ teammatesPending: true });
    }

    // Fetch games and picks
    const result = await db.execute({
      sql: `
        SELECT 
          g.dk_game_id,
          g.game_date,
          g.home_team,
          g.away_team,
          g.spread,
          g.home_score,
          g.away_score,
          g.winning_team,
          pl.player_name,
          p.pick
        FROM Games_2025_26 g
        LEFT JOIN Picks_2025_26 p ON g.dk_game_id = p.dk_game_id
        LEFT JOIN Players pl ON p.player_id = pl.player_id
        WHERE g.nfl_week = ?
        ORDER BY g.game_date ASC, pl.player_name ASC;
      `,
      args: [weekNum],
    });

    const rows = result.rows;

    if (rows.length === 0) {
      return res.status(200).json([]);
    }

    // Combine picks for each game
    const gamesMap = {};

    rows.forEach(row => {
      const gameId = row.dk_game_id;

      if (!gamesMap[gameId]) {
        gamesMap[gameId] = {
          dk_game_id: gameId,
          game_date: row.game_date,
          home_team: row.home_team,
          away_team: row.away_team,
          spread: row.spread,
          home_score: row.home_score,
          away_score: row.away_score,
          winning_team: row.winning_team,
          picks: {}, // will hold player_name: pick
        };
      }

      if (row.player_name && row.pick) {
        gamesMap[gameId].picks[row.player_name] = row.pick;
      }
    });

    // Convert map to array
    const gamesWithPicks = Object.values(gamesMap);

    res.status(200).json(gamesWithPicks);

  } catch (err) {
    console.error("Error in get-week-picks:", err);
    res.status(500).json({ error: "Server error loading week picks" });
  }
}
