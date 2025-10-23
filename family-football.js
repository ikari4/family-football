// javascript

fetch('https://api.the-odds-api.com/v4/sports/americanfootball_nfl/odds/?apiKey=1609fd4bd3426401d97740caa596640d&regions=us&markets=h2h,spreads&oddsFormat=american')
    .then(function(response) {
        console.log(response.json());
    });