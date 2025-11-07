// api/scores-refresh.js

import { createClient } from "@libsql/client";

export default async function handler (req, res) {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
    });

  const { gameIds } = req.body;
  if (!Array.isArray(gameIds) || gameIds.length === 0) {
    return res.status(400).json({ error: "No game IDs provided" });
  }

  // Get game data from the-odds-api
    const urlBase = 'https://api.the-odds-api.com/v4/sports/americanfootball_nfl/scores/';
    const apiKey = process.env.API_KEY;
    const daysFrom = 3;
    //   const eventIds = '';
    const url = urlBase +
        "?apiKey=" + apiKey + 
        "&daysFrom=" + daysFrom;
        // "&eventIds=" + eventIds;

    try {
        const response = await fetch(url);

    if (!response.ok) {
        return res.status(response.status).json({ error: "API request failed" });
    }
    // Extract data from the-odds-api data array
    const scoresData = await response.json();
    const requestsRemaining = response.headers.get("x-requests-remaining");
    console.log("Requests remaining: ", requestsRemaining);
    
    // Filter scores only for your game IDs
    const relevantScores = scoresData.filter(g =>
      gameIds.includes(g.id)
    );

    console.log("Releant Scores: ", relevantScores);

    // Update your Games table for each matching game
    const updates = [];
    for (const g of relevantScores) {
      const homeScore = g.scores?.find(t => t.name === g.home_team)?.score ?? null;
      const awayScore = g.scores?.find(t => t.name === g.away_team)?.score ?? null;

      let winningTeam = null;
      if (homeScore !== null && awayScore !== null) {
        winningTeam =
          homeScore > awayScore
            ? g.home_team
            : awayScore > homeScore
            ? g.away_team
            : "TIE";
      }

      await db.execute({
        sql: `
          UPDATE Games_2025_26
          SET home_score = ?, away_score = ?, winning_team = ?
          WHERE dk_game_id = ?
        `,
        args: [homeScore, awayScore, winningTeam, g.id],
      });

      updates.push({
        dk_game_id: g.id,
        home_score: homeScore,
        away_score: awayScore,
        winning_team: winningTeam,
      });
    }

    console.log(`Updated ${updates.length} games with latest scores`);

    res.status(200).json({ updated: updates });
  } catch (err) {
    console.error("Error refreshing scores:", err);
    res.status(500).json({ error: err.message || "Failed to refresh scores" });
  }
}

