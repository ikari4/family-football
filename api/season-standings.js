// season-standings.js
// Return array with all winners and player picks with game and nfl week ids

import { createClient } from "@libsql/client";
export default async function handler (req, res) {
    try {
        const db = createClient({
        url: process.env.TURSO_DATABASE_URL,
        authToken: process.env.TURSO_AUTH_TOKEN,
        }); 

        const result = await db.execute({
        sql: `
            SELECT 
            g.dk_game_id,
            g.nfl_week,
            g.winning_team,
            pl.player_name,
            p.pick
            FROM Games_2025_26 g
            LEFT JOIN Picks_2025_26 p ON g.dk_game_id = p.dk_game_id
            LEFT JOIN Players pl ON p.player_id = pl.player_id
            ORDER BY g.game_date ASC, pl.player_name ASC;
        `,

        });
        res.status(200).json(result.rows);
    } catch (err) {
        alert("Error updating standings: " + err);
        res.status(500).json({ error: "Failed to fetch season standings" });
    }
}