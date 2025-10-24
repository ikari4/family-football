// api/signup.js

export default async function handler(req, res) {
  const url = 'https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=1609fd4bd3426401d97740caa596640d&regions=us&markets=h2h,spreads&oddsFormat=american';

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
