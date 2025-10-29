// family-football.js

window.addEventListener("load", async () => {
    const player = JSON.parse(localStorage.getItem("player"));
    const loginModal = document.getElementById("loginModal");
    const playerInfo = document.getElementById("playerInfo");
    const refreshOddsBtn = document.getElementById("refreshOddsBtn");
    const gameContainer = document.getElementById("gameList");

    if (!player) {
      loginModal.style.display = "block";
      return;
    }

    loginModal.style.display = "none";
    playerInfo.style.display = "block";
    document.getElementById("welcomeText").textContent = `Welcome, ${player.player_name}!`;  

    try {
      const res = await fetch("/api/get-games");
      const games = await res.json();

      if (!res.ok) {
        console.error("Error getting games:", games.error);
        gameContainer.innerHTML = `<p style="color:red;">Error loading games.</p>`;
        return;
    }
    
      if (games.length === 0) {
        gameContainer.innerHTML = "<p>No games found for this week.</p>";
        refreshOddsBtn.style.display = "inline-block";
        return;
    }
    
    const picksRes = await fetch(`/api/get-picks?player_id=${player.player_id}`);
    const picksData = await picksRes.json();
    console.log(picksData);
    
    if (!picksRes.ok) {
      console.error("Error checking picks:", picksData.error);
      gameContainer.innerHTML = `<p style="color:red;">Error checking your picks.</p>`;
      return;
    }

    const pickedGameIds = new Set(picksData.map(p => p.dk_game_id));
    const gamesToPick = games.filter(g => !pickedGameIds.has(g.dk_game_id));

    if (gamesToPick.length === 0) {
      gameContainer.innerHTML = "<p>You’ve already made your picks for this week!</p>";
      return;
    }

    let html = "<h3>Make Your Picks:</h3>";
    gamesToPick.forEach((g, i) => {
      const gameId = g.dk_game_id;
      const spread = g.spread ? g.spread : "PK";
      html += `
        <div class="game">
          <label>
            <input type="radio" name="game-${i}" value="${g.away_team}" data-game-id="${gameId}">
            ${g.away_team} ${spread}
          </label>
          @
          <label>
            <input type="radio" name="game-${i}" value="${g.home_team}" data-game-id="${gameId}">
            ${g.home_team}
          </label>
        </div>
        <hr>
      `;
    });

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

      console.log("Picks being saved:", picks);
      console.log(picks);

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
  // Remove player from local storage
  localStorage.removeItem("player");

  // Hide player info
  document.getElementById("playerInfo").style.display = "none";

  // Show login modal again
  document.getElementById("loginModal").style.display = "block";
});

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





