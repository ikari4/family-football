// api/football.js

import { createClient } from "@libsql/client";

export default async function handler (req, res) {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  // WEEK 1 kickoff: Thursday Sept 4, 2025
  const nflWeeks = [
    { week: 1, start: "2025-09-04", end: "2025-09-10" },
    { week: 2, start: "2025-09-11", end: "2025-09-17" },
    { week: 3, start: "2025-09-18", end: "2025-09-24" },
    { week: 4, start: "2025-09-25", end: "2025-10-01" },
    { week: 5, start: "2025-10-02", end: "2025-10-08" },
    { week: 6, start: "2025-10-09", end: "2025-10-15" },
    { week: 7, start: "2025-10-16", end: "2025-10-22" },
    { week: 8, start: "2025-10-23", end: "2025-10-29" },
    { week: 9, start: "2025-10-30", end: "2025-11-05" },
    { week: 10, start: "2025-11-06", end: "2025-11-12" },
    { week: 11, start: "2025-11-13", end: "2025-11-19" },
    { week: 12, start: "2025-11-20", end: "2025-11-26" },
    { week: 13, start: "2025-11-27", end: "2025-12-03" },
    { week: 14, start: "2025-12-04", end: "2025-12-10" },
    { week: 15, start: "2025-12-11", end: "2025-12-17" },
    { week: 16, start: "2025-12-18", end: "2025-12-24" },
    { week: 17, start: "2025-12-25", end: "2025-12-31" },
    { week: 18, start: "2026-01-01", end: "2026-01-07" }
  ];

  // Find current NFL Week
  const today = new Date();
  const currentWeek = nflWeeks.find(w =>
    today >= new Date(w.start) && today <= new Date(w.end)
  );

  if (!currentWeek) {
    return res.status(400).json({ error: "Not within NFL season" });
  }

  // Get game data from the-odds-api
  const urlBase = 'https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/';
  const apiKey = process.env.API_KEY;
  const regions = 'us';
  const markets = 'spreads';
  const bookmakers = 'draftkings';
  const oddsFormat = 'american';
  const url = urlBase +
    "?apiKey=" + apiKey + 
    "&regions=" + regions + 
    "&bookmakers=" + bookmakers + 
    "&markets=" + markets + 
    "&oddsFormat=" + oddsFormat;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: "API request failed" });
    }
    // Extract data from the-odds-api data array
    const data = await response.json();
    const requestsRemaining = response.headers.get("x-requests-remaining");
    const games = data.map(game => {
      const draftKings = game.bookmakers.find(b => b.key === "draftkings");
      const spreads = draftKings?.markets.find(m => m.key === "spreads");
      const awayOutcome = spreads?.outcomes.find(o => o.name === game.away_team);

      return {
        dk_game_id: game.id,
        game_date: game.commence_time,
        home_team: game.home_team,
        away_team: game.away_team,
        spread: awayOutcome?.point ?? null
      };
    });

    const weekGames = games.filter(g => {
      const date = new Date(g.game_date);
      return date >= new Date(currentWeek.start) && date <= new Date(currentWeek.end);
    });

    // Send to Turso Database
    for (const g of weekGames) {
      await db.execute({
        sql: `
          INSERT INTO Games_2025_26
            (dk_game_id, game_date, nfl_week, home_team, away_team, spread)
          VALUES
            (?, ?, ?, ?, ?, ?)
          ON CONFLICT(dk_game_id) DO UPDATE SET
            game_date = excluded.game_date,
            nfl_week = excluded.nfl_week,
            home_team = excluded.home_team,
            away_team = excluded.away_team,
            spread = excluded.spread
          `,
          args: [
            g.dk_game_id,
            g.game_date,
            currentWeek.week,
            g.home_team,
            g.away_team,
            g.spread
          ],
      });
    }

    // Return JSON to frontend
    res.status(200).json({
      week: currentWeek.week,
      saved: weekGames.length,
      usage: requestsRemaining,
      games: weekGames,
      preview: weekGames.slice(0, 3)
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
}
