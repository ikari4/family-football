// family-football.js
// Handles player login, the shows player this weeks games to pick.
// If all games picked for all teammates, shows picks table.

window.addEventListener("load", async () => {
    const player = JSON.parse(localStorage.getItem("player"));
    const loginModal = document.getElementById("loginModal");
    const bannerRow = document.getElementById("bannerRow");
    const refreshOddsBtn = document.getElementById("refreshOddsBtn");
    const gameContainer = document.getElementById("gameList");
    const loadingEl = document.getElementById("loadingMessage");
    // const seasonBtn = document.getElementById("seasonBtn");

    window.picksTableData = [];
    window.playerNames = [];
    window.playerWins = {};

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

          window.picksTableData = picksTableData;
       
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
          window.playerNames = playerNames;

          // Build HTML for table

          // Update scores

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
            const updates = data.updates || [];

            // Update local gamesData with the new winning_team values
            updates.forEach(update => {
              const match = window.picksTableData.find(g => g.dk_game_id === update.dk_game_id);
              if (match) {
                match.winning_team = update.winning_team;
                match.home_score = update.home_score;
                match.away_score = update.away_score;
              }
            });

            // Reset win counters
            playerNames.forEach(player => {
              (playerWins[player] = 0);
          });
            
            // Count wins for completed games
            picksTableData.forEach(game => {
              if (game.winning_team) { // Only completed games
                playerNames.forEach(player => {
                  const pick = game.picks[player];
                  if (pick && pick === game.winning_team) {
                    playerWins[player] += 1;
                  }
                });
              }
            });

            window.playerWins = playerWins;

              if (!response.ok) {
                throw new Error("Refresh failed");
              }
              alert(`Scores refreshed successfully! Requests left: ${data.requests_remaining}`);

            } catch (err) {
              alert("Error refreshing scores: " + err.message);
            } 
       
          window.playerWins = playerWins;
          const allWeek = await fetch("/api/get-games?mode=week");
          const allWeekGames = await allWeek.json();
          const firstGameStart = new Date(Math.min(...allWeekGames.map(g => new Date(g.game_date).getTime())));
          const now = new Date();
        
          let htmlPicks = `<h3>Week ${week}</h3>`;
          htmlPicks += `<div><table class="scores-table">`;
          htmlPicks += "<thead><tr>";
          playerNames.forEach(name => {
            htmlPicks += `<th>${name}</th>`;
          });
          htmlPicks += "</tr></thead><tbody><tr>";
          playerNames.forEach(name => {
            htmlPicks += `<td>${playerWins[name]}</td>`
          });
          htmlPicks += "</tr></tbody></table></div>";

          for (const [day, dayGames] of Object.entries(gamesByDay)) {
            htmlPicks += `<h4 class="day-header">${day}</h4>`;
            htmlPicks += `<div><table class="picks-table">`;
            htmlPicks += "<thead><tr>";
            htmlPicks += "<th>Away Team</th><th>Score</th><th>Line</th><th>Score</th><th>Home Team</th>";
            playerNames.forEach(name => htmlPicks += `<th>${name}</th>`);
            htmlPicks += "</tr></thead><tbody>";

            dayGames.forEach(game => {
              const spreadDisplay = game.spread > 0 ? `+${game.spread}` : game.spread ?? "PK";
              htmlPicks += "<tr>";
              htmlPicks += `<td>${game.away_team}</td>`;
              htmlPicks += `<td>${game.away_score ?? "-"}</td>`;
              htmlPicks += `<td>${spreadDisplay}</td>`;
              htmlPicks += `<td>${game.home_score ?? "-"}</td>`;
              htmlPicks += `<td>${game.home_team}</td>`;
              playerNames.forEach(name => {
                const pick = game.picks[name] || "";
                const highlight = pick === game.winning_team ? "class='correct-pick'" : "";
                htmlPicks += `<td ${highlight}>${pick}</td>`;
              });
              htmlPicks += "</tr>";
            });

            htmlPicks += "</tbody></table></div>";
          }

          gameContainer.innerHTML = htmlPicks;
          loadingEl.style.display = "none";
          
          
          // Display season standings
          try {
            const standingsRes = await fetch("/api/season-standings");
            const standingsData = await standingsRes.json();

            if (!Array.isArray(standingsData)) {
              throw new Error("Invalid standings data");
            }

            // Group wins per week per player
            const playerWinsByWeek = {}; // { week: { playerName: wins } }
            const allPlayers = new Set();

            standingsData.forEach(row => {
              const week = row.nfl_week;
              const player = row.player_name;
              const pick = row.pick;
              const winner = row.winning_team;

              if (!player || !week) return;
              allPlayers.add(player);

              if (!playerWinsByWeek[week]) playerWinsByWeek[week] = {};

              if (winner && pick === winner) {
                playerWinsByWeek[week][player] = (playerWinsByWeek[week][player] || 0) + 1;
              } else if (!playerWinsByWeek[week][player]) {
                playerWinsByWeek[week][player] = 0;
              }
            });

            const playerNames = Array.from(allPlayers);

            // Build HTML standings table
            let htmlStand = `<h3>Season Standings</h3>`;
            htmlStand += `<div><table class="scores-table">`;
            
            htmlStand += `<th>Week</th>`;
            playerNames.forEach(name => {
              htmlStand += `<th>${name}</th>`;
            });
            htmlStand += "</tr></thead><tbody>";

            // Add each week's row
            const sortedWeeks = Object.keys(playerWinsByWeek).sort((a, b) => a - b);
            const totalWins = Object.fromEntries(playerNames.map(n => [n, 0]));

            sortedWeeks.forEach(week => {
              htmlStand += `<tr><td>${week}</td>`;
              playerNames.forEach(name => {
                const wins = playerWinsByWeek[week][name] || 0;
                totalWins[name] += wins;
                htmlStand += `<td>${wins}</td>`;
              });
              htmlStand += `</tr>`;
            });

            // Add totals row
            htmlStand += `<tr><th>Total</th>`;
            playerNames.forEach(name => {
              htmlStand += `<th>${totalWins[name]}</th>`;
            });
            htmlStand += `</tr>`;

            htmlStand += "</tbody></table></div>";

            // Display on page
            const tableContainer = document.getElementById("standingsArea");
            tableContainer.innerHTML = htmlStand;

          } catch (err) {
              alert("Error loading standings: " + err.message);
          } 
                
        return;

        } catch (err) {
          console.error("Error loading weekly picks:", err);
          gameContainer.innerHTML = "<p>Error loading weekly picks</p>";
        } 
      }

      // Display un-picked games grouped by day
      const week = games[0]?.nfl_week || "Current";
      let htmlToPick = `<h3>Week ${week}</h3>`;
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
        htmlToPick += `<h4 class="day-header">${day}</h4>`;

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

          htmlToPick += `
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

      htmlToPick += `<button id="submitBtn">Submit</button>`;
      gameContainer.innerHTML = htmlToPick;

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

// On 'Season' button click
// Show table with season standing including current week
// document.getElementById("seasonBtn").addEventListener("click", async () => {
//   const seasonBtn = document.getElementById("seasonBtn");
//   seasonBtn.disabled = true;
//   seasonBtn.textContent = "Wait...";

//   try {
//     const standingsRes = await fetch("/api/season-standings");
//     const standingsData = await standingsRes.json();

//     if (!Array.isArray(standingsData)) {
//       throw new Error("Invalid standings data");
//     }

    // Group wins per week per player
    // const playerWinsByWeek = {}; // { week: { playerName: wins } }
    // const allPlayers = new Set();

    // standingsData.forEach(row => {
    //   const week = row.nfl_week;
    //   const player = row.player_name;
    //   const pick = row.pick;
    //   const winner = row.winning_team;

    //   if (!player || !week) return;
    //   allPlayers.add(player);

    //   if (!playerWinsByWeek[week]) playerWinsByWeek[week] = {};

    //   if (winner && pick === winner) {
    //     playerWinsByWeek[week][player] = (playerWinsByWeek[week][player] || 0) + 1;
    //   } else if (!playerWinsByWeek[week][player]) {
    //     playerWinsByWeek[week][player] = 0;
    //   }
    // });

    // const playerNames = Array.from(allPlayers);

    // Build HTML standings table
    // let html = `<h3>Season Standings</h3>`;
    // html += `<div><table class="scores-table">`;
    // html += "<thead><tr><th>Week</th>";

    // playerNames.forEach(name => {
    //   html += `<th>${name}</th>`;
    // });
    // html += "</tr></thead><tbody>";

    // Add each week's row
    // const sortedWeeks = Object.keys(playerWinsByWeek).sort((a, b) => a - b);
    // const totalWins = Object.fromEntries(playerNames.map(n => [n, 0]));

    // sortedWeeks.forEach(week => {
    //   html += `<tr><td>${week}</td>`;
    //   playerNames.forEach(name => {
    //     const wins = playerWinsByWeek[week][name] || 0;
    //     totalWins[name] += wins;
    //     html += `<td>${wins}</td>`;
    //   });
    //   html += `</tr>`;
    // });

    // Add totals row
    // html += `<tr><th>Total</th>`;
    // playerNames.forEach(name => {
    //   html += `<th>${totalWins[name]}</th>`;
    // });
    // html += `</tr>`;

    // html += "</tbody></table></div>";

    // Display on page
//     const tableContainer = document.getElementById("standingsArea");
//     tableContainer.innerHTML = html;

//   } catch (err) {
//     alert("Error loading standings: " + err.message);
//   } finally {
//     seasonBtn.disabled = false;
//     seasonBtn.textContent = "Season";
//   }
// });


