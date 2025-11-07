// family-football.js
// Handles player login, the shows player this weeks games to pick.
// If all games picked for all teammates, shows picks table.
// Scores button updates completed games.

window.addEventListener("load", async () => {
    const player = JSON.parse(localStorage.getItem("player"));
    const loginModal = document.getElementById("loginModal");
    const bannerRow = document.getElementById("bannerRow");
    const refreshOddsBtn = document.getElementById("refreshOddsBtn");
    const scoresBtn = document.getElementById("scoresBtn");
    const gameContainer = document.getElementById("gameList");
    const loadingEl = document.getElementById("loadingMessage");

    // If player is not logged in, show login screen
    if (!player) {
      loginModal.style.display = "block";
      return;
    }

    loginModal.style.display = "none";
    bannerRow.style.display = "block";

    // If player is logged in, show either games to pick or picks table
    try {
      // Call 'get-games' for a list of all games from current week from Games table in database
      loadingEl.style.display = "block";
      const res = await fetch("/api/get-games?mode=current");
      const games = await res.json();

      if (!res.ok) {
        console.error("Error getting games:", games.error);
        gameContainer.innerHTML = `<p style="color:red;">Error loading games</p>`;
        return;
      }

      if (games.length === 0) {
        gameContainer.innerHTML = "<p>No games found for this week</p>";
        loadingEl.style.display = "none";
        refreshOddsBtn.style.display = "inline-block";
        return;
      }
    
      // Call 'get-picks' for a list of all games from week already picked by player
      const picksRes = await fetch(`/api/get-picks?player_id=${player.player_id}`);
      const picksData = await picksRes.json();
    
      if (!picksRes.ok) {
        console.error("Error checking picks:", picksData.error);
        gameContainer.innerHTML = `<p style="color:red;">Error checking your picks</p>`;
        return;
      }

      // Display all un-picked current week games for player
      const pickedGameIds = new Set(picksData.map(p => p.dk_game_id));
      const gamesToPick = games.filter(g => !pickedGameIds.has(g.dk_game_id));

      // If all games already picked, get data for picks table
      if (gamesToPick.length === 0) {
        // Call 'display-picks' for data to display in picks table
        try {
          const week = games[0]?.nfl_week || "Current";
          const picksTableRes = await fetch(`/api/display-picks?nfl_week=${week}&player_id=${player.player_id}`);
          const picksTableData = await picksTableRes.json();

          if (!picksTableRes.ok) {
            console.error("Error loading picks table:", picksTableData.error);
            gameContainer.innerHTML = `<p style="color:red;">Error loading weekly picks</p>`;
            return;
          }

          if (picksTableData.teammatesPending) {
            gameContainer.innerHTML = `<p>Waiting for your teammate...</p>`;
            loadingEl.style.display = "none";
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
            html += "<th>Away Team</th><th>Score</th><th>Line</th><th>Score</th><th>Home Team</th>";
            playerNames.forEach(name => html += `<th>${name}</th>`);
            html += "</tr></thead><tbody>";

            dayGames.forEach(game => {
              const spreadDisplay = game.spread > 0 ? `+${game.spread}` : game.spread ?? "PK";
              html += "<tr>";
              html += `<td>${game.away_team}</td>`;
              html += `<td>${game.away_score ?? "-"}</td>`;
              html += `<td>${spreadDisplay}</td>`;
              html += `<td>${game.home_score ?? "-"}</td>`;
              html += `<td>${game.home_team}</td>`;
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
          
          const allWeek = await fetch("/api/get-games?mode=week");
          const allWeekGames = await allWeek.json();
          const firstGameStart = new Date(Math.min(...allWeekGames.map(g => new Date(g.game_date).getTime())));
          const now = new Date();
          if (now >= firstGameStart) {
            scoresBtn.style.display = "inline-block";
          }

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

      html += `<button id="submitBtn">Submit</button>`;
      gameContainer.innerHTML = html;

      // On 'Submit' button click
      // Call 'save-picks' to write to database
      document.getElementById("submitBtn").addEventListener("click", async () => {
        submitBtn.disabled = true;
        submitBtn.textContent = "Wait..."
        const radioButtons = document.querySelectorAll("input[type='radio']:checked");
        if (radioButtons.length === 0) {
          alert("Please make at least one pick!");
          submitBtn.disabled = false;
          submitBtn.textContent = "Submit";
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
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit";
        location.reload();
      });

    } catch (err) {
      console.error("Load error:", err);
      gameContainer.innerHTML = "<p>Error loading data.</p>";
    }
});

// On 'Login' button click
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

// On 'Logout' button click
document.getElementById("logoutBtn").addEventListener("click", () => {
  localStorage.removeItem("player");
  location.reload();
  document.getElementById("playerInfo").style.display = "none";
  document.getElementById("loginModal").style.display = "block";
});

// On 'Games' button click
// Get games from API and save them in database
document.getElementById("refreshOddsBtn").addEventListener("click", async () => {
  const gamesBtn = document.getElementById("refreshOddsBtn");
  gamesBtn.disabled = true;
  gamesBtn.textContent = "Wait...";

  try {
    const response = await fetch("/api/odds-refresh");
    if (!response.ok) {
      throw new Error("Refresh failed");
    }
    alert("Odds refreshed successfully!");
    gamesBtn.style.display = "none";
    location.reload();
  } catch (err) {
    alert("Error refreshing odds: " + err.message);
  } finally {
    gamesBtn.disabled = false;
    gamesBtn.textContent = "Games";
  }
});

// On 'Scores' button click
// Get scores from the API and save them in the database
  document.getElementById("scoresBtn").addEventListener("click", async () => {
  const scoresBtn = document.getElementById("scoresBtn");
  scoresBtn.disabled = true;
  scoresBtn.textContent = "Wait...";

  try {
    const gamesRes = await fetch("/api/get-games?mode=week");
    const games = await gamesRes.json();

    if (!gamesRes.ok) {
      throw new Error ("Error fetching games: " + (games.error || "Unknown error"));
    }

    const gameIds = games.map(g => g.dk_game_id);
    if (gameIds.length === 0) {
      alert("No games found for this week.");
      return;
    }

    const response = await fetch("/api/scores-refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gameIds }),
    });

    const data = await response.json();
    requestsRemaining = data.requestsRemaining;

    if (!response.ok) {
      throw new Error("Refresh failed");
    }
    alert(`Scores refreshed successfully! Requests left: ${requestsRemaining}`);
    scoresBtn.disabled = false;
    scoresBtn.textContent = "Scores";
  } catch (err) {
    alert("Error refreshing scores: " + err.message);
  } finally {
    scoresBtn.disabled = false;
    scoresBtn.textContent = "Scores";
    location.reload();
  }
});




