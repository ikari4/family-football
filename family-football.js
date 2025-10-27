// family-football.js

document.getElementById("makeBtn").addEventListener("click", async () => {
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




