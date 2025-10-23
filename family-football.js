// javascript

fetch('https://api.the-odds-api.com/v4/sports/americalfootball/nfl/odds/?apiKey=1609fd4bd3426401d97740caa596640d&regions=us&markets=spreads&oddsFormat=american')
    .then(function(response) {
        console.log(response.json());
    });