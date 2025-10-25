// api/football.js

export default async function handler(req, res) {
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

    const data = await response.json();
    const requestsRemaining = response.headers.get("x-requests-remaining");

    // Return JSON to frontend
    res.status(200).json({
        games: data,
        usage: requestsRemaining
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
}
