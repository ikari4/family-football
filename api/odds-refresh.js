// api/odds-refresh.js

import { createClient } from "@libsql/client";

export default async function handler (req, res) {
  const db = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

    // Build UTC dates from US Eastern
    function getEasternDateUTC(year, month, day, hourEastern) {
      const date = new Date(Date.UTC(year, month, day, hourEastern));
      const easternMillis = new Date(date.toLocaleString("en-US", { timeZone: "America/New_York" })).getTime();
      const utcOffset = date.getTime() - easternMillis;
      return new Date(date.getTime() - utcOffset);
    }
  
  const nflWeeks = Array.from({ length: 18 }, (_, i) => {
    const week = i + 1;

    // Start: Week 1 begins Tuesday Sept 2, 2025 @ 12:00 PM Eastern (8 = September)
    const start = getEasternDateUTC(2025, 8, 2 + i * 7, 12);

    // End: Noon the following Tuesday minus 1 millisecond
    const end = new Date(getEasternDateUTC(2025, 8, 2 + (i+1) * 7, 12) - 1);

    return { week, start, end };
  });

  // Find the current week using UTC (server time)
  const today = new Date();

  const currentWeek = nflWeeks.find(w => today >= w.start && today <= w.end);

  if (!currentWeek) {
    console.error("Today:", today.toISOString());
    return res.status(400).json({ error: "Not within NFL season" });
  }

  console.log("Current Week:", currentWeek.week);

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
    res.status(200).send("Odds update completed");

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
}
