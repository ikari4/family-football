// family-football.js

window.addEventListener("load", async () => {
    const player = JSON.parse(localStorage.getItem("player"));
    const loginModal = document.getElementById("loginModal");
    const bannerRow = document.getElementById("bannerRow");
    const refreshOddsBtn = document.getElementById("refreshOddsBtn");
    const gameContainer = document.getElementById("gameList");
    const loadingEl = document.getElementById("loadingMessage");

    if (!player) {
      loginModal.style.display = "block";
      return;
    }

    loginModal.style.display = "none";
    bannerRow.style.display = "block";

    try {
      // Gets all games from current week from Games_2025_26
      loadingEl.style.display = "block";
      const res = await fetch("/api/get-games");
      const games = await res.json();

      if (!res.ok) {
        console.error("Error getting games:", games.error);
        gameContainer.innerHTML = `<p style="color:red;">Error loading games</p>`;
        return;
      }

      if (games.length === 0) {
        gameContainer.innerHTML = "<p>No games found for this week</p>";
        refreshOddsBtn.style.display = "inline-block";
        return;
      }
    
      // Get an array of all picked games for current player
      const picksRes = await fetch(`/api/get-picks?player_id=${player.player_id}`);
      const picksData = await picksRes.json();
    
      if (!picksRes.ok) {
        console.error("Error checking picks:", picksData.error);
        gameContainer.innerHTML = `<p style="color:red;">Error checking your picks</p>`;
        return;
      }

      // Displays all un-picked current week games for player
      const pickedGameIds = new Set(picksData.map(p => p.dk_game_id));
      const gamesToPick = games.filter(g => !pickedGameIds.has(g.dk_game_id));

      if (gamesToPick.length === 0) {
        // Render picks table when player has already picked
        try {
          const week = games[0]?.nfl_week || "Current";
          const picksTableRes = await fetch(`/api/get-week-picks?nfl_week=${week}&player_id=${player.player_id}`);
          const picksTableData = await picksTableRes.json();

          if (!picksTableRes.ok) {
            console.error("Error loading picks table:", picksTableData.error);
            gameContainer.innerHTML = `<p style="color:red;">Error loading weekly picks</p>`;
            return;
          }

          if (picksTableData.teammatesPending) {
            gameContainer.innerHTML = `<p>Waiting for your teammate...</p>`;
            return;
          }

          if (!picksTableData.length) {
            gameContainer.innerHTML = `<p>No picks found for this week</p>`;
            return;
          }

          // Group games by day
          const gamesByDay = picksTableData.reduce((groups, game) => {
            const dateStr = game.game_date?.trim();
            const date = new Date(dateStr);
            if (isNaN(date)) {
              console.warn("Invalid date for game:", game);
            }
            const dayKey = date.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric"
            });
            if (!groups[dayKey]) groups[dayKey] = [];
            groups[dayKey].push(game);
            return groups;
          }, {});

          // Get all player names dynamically
          const allPlayerNames = new Set();
          picksTableData.forEach(game => {
            Object.keys(game.picks).forEach(name => allPlayerNames.add(name));
          });
          const playerNames = Array.from(allPlayerNames);

          // Build HTML for table
          let html = `<h3>Week ${week} Picks</h3>`;
          for (const [day, dayGames] of Object.entries(gamesByDay)) {
            html += `<h4 class="day-header">${day}</h4>`;
            html += `<div><table class="picks-table">`;
            html += "<thead><tr>";
            html += "<th>Home Team</th><th>Score</th><th>Line</th><th>Score</th><th>Away Team</th>";
            playerNames.forEach(name => html += `<th>${name}</th>`);
            html += "</tr></thead><tbody>";

            dayGames.forEach(game => {
              const spreadDisplay = game.spread > 0 ? `+${game.spread}` : game.spread ?? "PK";
              html += "<tr>";
              html += `<td>${game.home_team}</td>`;
              html += `<td>${game.home_score ?? "-"}</td>`;
              html += `<td>${spreadDisplay}</td>`;
              html += `<td>${game.away_score ?? "-"}</td>`;
              html += `<td>${game.away_team}</td>`;
              playerNames.forEach(name => {
                const pick = game.picks[name] || "";
                const highlight = pick === game.winning_team ? "class='correct-pick'" : "";
                html += `<td ${highlight}>${pick}</td>`;
              });
              html += "</tr>";
            });

            html += "</tbody></table></div>";
          }

          gameContainer.innerHTML = html;
          loadingEl.style.display = "none";
          return;

        } catch (err) {
          console.error("Error loading weekly picks:", err);
          gameContainer.innerHTML = "<p>Error loading weekly picks</p>";
        } 
      }

      // Display un-picked games grouped by day
      const week = games[0]?.nfl_week || "Current";
      let html = `<h3>Week ${week}</h3>`;
      const gamesByDay = gamesToPick.reduce((groups, game) => {
        const date = new Date(game.game_date);
        const dayKey = date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric"
        });
        if (!groups[dayKey]) groups[dayKey] = [];
        groups[dayKey].push(game);
        return groups;
      }, {});

      for (const [day, dayGames] of Object.entries(gamesByDay)) {
        html += `<h4 class="day-header">${day}</h4>`;

        dayGames.forEach((g, i) => {
          const gameId = g.dk_game_id;
          let spreadDisplay = "PK";
          if (g.spread !== null && g.spread !== undefined) {
            const spreadNum = Number(g.spread);
            if (!isNaN(spreadNum)) {
              spreadDisplay = spreadNum > 0 ? `+${spreadNum}` : spreadNum.toString();
            }
          }

          const nameAttr = `game-${gameId}`;

          html += `
            <div class="game">  
              <div class="team-row">
                <label class="team-option">
                  <input type="radio" name="game-${nameAttr}" value="${g.away_team}" data-game-id="${gameId}">
                  ${g.away_team} ${spreadDisplay}
                </label>
              </div>
              <div class="at">@</div>
              <div class="team-row">
                <label class="team-option">
                  <input type="radio" name="game-${nameAttr}" value="${g.home_team}" data-game-id="${gameId}">
                  ${g.home_team}
                </label>
              </div>
            </div>
            <hr>
          `;
        });
        
        loadingEl.style.display = "none";
      }

      html += `<button id="submitBtn">Submit Picks</button>`;
      gameContainer.innerHTML = html;

      // Attach submit handler dynamically
      document.getElementById("submitBtn").addEventListener("click", async () => {
        const radioButtons = document.querySelectorAll("input[type='radio']:checked");
        if (radioButtons.length === 0) {
          alert("Please make at least one pick!");
          return;
        }
        const picks = Array.from(radioButtons).map(rb => ({
          dk_game_id: rb.dataset.gameId,
          pick: rb.value,
          player_id: player.player_id,
        }));
        const response = await fetch("/api/save-picks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ picks }),
        });
        const result = await response.json();
        alert(result.message || "Picks saved!");
        location.reload();
      });

  } catch (err) {
    console.error("Load error:", err);
    gameContainer.innerHTML = "<p>Error loading data.</p>";
  }
});

// Login logic
document.getElementById("loginBtn").addEventListener("click", async () => {
  const email = document.getElementById("emailInput").value;
  const pw = document.getElementById("pwInput").value;

  const res = await fetch("/api/login", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ email, pw })
  });

  const data = await res.json();
  if (!res.ok) {
      document.getElementById("loginError").textContent = data.error;
      return;
  }

  localStorage.setItem("player", JSON.stringify(data.player));
  document.getElementById("loginModal").style.display = "none";
  location.reload();
});

document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("player");
  location.reload();
  document.getElementById("playerInfo").style.display = "none";
  document.getElementById("loginModal").style.display = "block";
});

// Refresh odds
document.getElementById("refreshOddsBtn").addEventListener("click", async () => {
  const btn = document.getElementById("refreshOddsBtn");
  btn.disabled = true;
  btn.textContent = "Refreshing...";

  try {
    const response = await fetch("/api/odds-refresh");
    if (!response.ok) {
      throw new Error("Refresh failed");
    }
    alert("Odds refreshed successfully!");
    btn.style.display = "none";
  } catch (err) {
    alert("Error refreshing odds: " + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = "Refresh Odds";
  }
});






