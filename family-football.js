// family-football.js

window.addEventListener("load", async () => {
    const player = JSON.parse(localStorage.getItem("player"));
    const loginModal = document.getElementById("loginModal");
    const bannerRow = document.getElementById("bannerRow");
    const refreshOddsBtn = document.getElementById("refreshOddsBtn");
    const gameContainer = document.getElementById("gameList");

    if (!player) {
      loginModal.style.display = "block";
      return;
    }

    loginModal.style.display = "none";
    bannerRow.style.display = "block";

    try {
      // Gets all games from current week from Games_2025_26
      const res = await fetch("/api/get-games");
      const games = await res.json();

      if (!res.ok) {
        console.error("Error getting games:", games.error);
        gameContainer.innerHTML = `<p style="color:red;">Error loading games.</p>`;
        return;
    }
      // Displays Get Games button if there are no games for current week in Games_2025_26  
      if (games.length === 0) {
        gameContainer.innerHTML = "<p>No games found for this week.</p>";
        refreshOddsBtn.style.display = "inline-block";
        return;
    }
    
    // Get an array of all picked games for current player
    const picksRes = await fetch(`/api/get-picks?player_id=${player.player_id}`);
    const picksData = await picksRes.json();
    
    if (!picksRes.ok) {
      console.error("Error checking picks:", picksData.error);
      gameContainer.innerHTML = `<p style="color:red;">Error checking your picks.</p>`;
      return;
    }

    // Displays all un-picked current week games for player
    const pickedGameIds = new Set(picksData.map(p => p.dk_game_id));
    const gamesToPick = games.filter(g => !pickedGameIds.has(g.dk_game_id));

    if (gamesToPick.length === 0) {
      gameContainer.innerHTML = "<p>You’ve already made your picks for this week!</p>";
      return;
    }

    const week = games[0]?.nfl_week || "Current";
    let html = `<h3>Week ${week}</h3>`;
    
    // Group games by game_date (day only, ignoring time)
    const gamesByDay = gamesToPick.reduce((groups, game) => {
      const date = new Date(game.game_date);
      // Create a readable day string (e.g., "Sunday, September 7")
      const dayKey = date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric"
      });
      
      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey].push(game);
      return groups;
    }, {});

    // Loop through each day group
    for (const [day, dayGames] of Object.entries(gamesByDay)) {
      html += `<h4 class="day-header">${day}</h4>`;

      dayGames.forEach((g, i) => {
        const gameId = g.dk_game_id;
     
        // Ensure we display a "+" before positive spreads
        let spreadDisplay = "PK"; // default for pick'em games
          if (g.spread !== null && g.spread !== undefined) {
            const spreadNum = Number(g.spread);
          if (!isNaN(spreadNum)) {
            spreadDisplay = spreadNum > 0 ? `+${spreadNum}` : spreadNum.toString();
          }
        }  
      
      html += `
        <div class="game">  
          <div class="team-row">
            <label class="team-option">
              <input type="radio" name="game-${i}" value="${g.away_team}" data-game-id="${gameId}">
              ${g.away_team} ${spreadDisplay}
            </label>
          </div>
          <div class="at">@</div>
          <div class="team-row">
            <label class="team-option">
              <input type="radio" name="game-${i}" value="${g.home_team}" data-game-id="${gameId}">
              ${g.home_team}
            </label>
          </div>
        </div>
          <hr>
        `;
      });
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
    
      // Captures all user picks and sends to Picks_2025_26
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

    // Save player session locally
    localStorage.setItem("player", JSON.stringify(data.player));

    document.getElementById("loginModal").style.display = "none";
    location.reload();
});


document.getElementById("logoutBtn").addEventListener("click", () => {
  // Remove player from local storage & clear screen
  localStorage.removeItem("player");
  location.reload();

  // Hide player info
  document.getElementById("playerInfo").style.display = "none";

  // Show login modal again
  document.getElementById("loginModal").style.display = "block";
});

// Get Games logic
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





