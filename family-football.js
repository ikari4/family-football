// family-football.js

window.addEventListener("load", async () => {
    const player = JSON.parse(localStorage.getItem("player"));
    if (!player) {
      document.getElementById("loginModal").style.display = "block";
      return;
    }

    document.getElementById("loginModal").style.display = "none";
    document.getElementById("playerInfo").style.display = "block";
    document.getElementById("welcomeText").textContent = `Welcome, ${player.player_name}!`;  

    try {
      const response = await fetch("/api/get-games");
      const games = await response.json();

    if (games.length === 0) {
      document.getElementById("refreshOddsBtn").style.display = "inline-block";
    }
    
    } catch (err) {
      console.error("Error checking games:", err);
    }
  }
);

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


document.getElementById("getPicksBtn").addEventListener("click", async () => {
  const gameContainer = document.getElementById("gameList");
  gameContainer.innerHTML = "<p>Loading games...</p>";

  try {
    const response = await fetch("/api/get-games");
    const games = await response.json();

    if (!games.length) {
      gameContainer.innerHTML = "<p>No games available for this week.</p>";
      return;
    }

    let html = "";
    games.forEach((g, i) => {
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

    gameContainer.innerHTML = html;
  } catch (error) {
    console.error(error);
    gameContainer.innerHTML = "<p>Error loading games.</p>";
  }
});

document.getElementById("submitBtn").addEventListener("click", async () => {
  const radioButtons = document.querySelectorAll("input[type='radio']:checked");
  
  if (radioButtons.length === 0) {
    alert("Please make at least one pick!");
    return;
  }

  const picks = Array.from(radioButtons).map(rb => ({
    dk_game_id: rb.dataset.gameId,
    pick: rb.value
  }));

  console.log("Picks being saved:", picks);

  const response = await fetch("/api/save-picks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ picks })
  });

  const result = await response.json();
  alert(result.message || "Saved!");
});




