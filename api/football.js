// api/football.js

export default async function handler(req, res) {
  const urlBase = 'https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/';
  const apiKey = '1609fd4bd3426401d97740caa596640d';
  const regions = 'us';
  const markets = 'spreads';
  const bookmakers = 'draftkings';
  const oddsFormat = 'american';
  const { end } = req.query;
  const commenceTimeTo = new Date(end).toISOString();
  const url = urlBase +
    "?apiKey=" + apiKey + 
    "&regions=" + regions + 
    "&bookmakers=" + bookmakers + 
    "&markets=" + markets + 
    "&oddsFormat=" + oddsFormat +
    "&commenceTimeTo=" + commenceTimeTo;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      return res.status(response.status).json({ error: "API request failed" });
    }

    const data = await response.json();

    // Return JSON to frontend
    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
}
