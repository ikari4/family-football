// family-football.js

// Call football.js to get odds from API for the current week
fetch('/api/football')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('Requests Remaining: ', data.usage);
    console.log('NFL Week: ', data.week );
    console.log('Filtered:', data.games);
  })
  .catch(error => {
    console.error('Error:', error);
  });

// data = [
//   {
//     "id": "ac02b1b59aa0623845378a02bc530c68",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-10-26T17:00:00Z",
//     "home_team": "Atlanta Falcons",
//     "away_team": "Miami Dolphins",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Atlanta Falcons",
//                 "price": -115,
//                 "point": -7.5
//               },
//               {
//                 "name": "Miami Dolphins",
//                 "price": -105,
//                 "point": 7.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "a061e80d1f50eab193b34d19f8e59f62",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-10-26T17:00:00Z",
//     "home_team": "Baltimore Ravens",
//     "away_team": "Chicago Bears",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Baltimore Ravens",
//                 "price": -110,
//                 "point": -7
//               },
//               {
//                 "name": "Chicago Bears",
//                 "price": -110,
//                 "point": 7
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "53d4369464c66630f03a5d128cd39b08",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-10-26T17:00:00Z",
//     "home_team": "Carolina Panthers",
//     "away_team": "Buffalo Bills",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Buffalo Bills",
//                 "price": -112,
//                 "point": -7
//               },
//               {
//                 "name": "Carolina Panthers",
//                 "price": -108,
//                 "point": 7
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "9c1f73e48ca9750f6e7d5d64874057c2",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-10-26T17:00:00Z",
//     "home_team": "Cincinnati Bengals",
//     "away_team": "New York Jets",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Cincinnati Bengals",
//                 "price": -108,
//                 "point": -6
//               },
//               {
//                 "name": "New York Jets",
//                 "price": -112,
//                 "point": 6
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "3536a3e857050d2dd6e2019ceb668f67",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-10-26T17:00:00Z",
//     "home_team": "New England Patriots",
//     "away_team": "Cleveland Browns",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Cleveland Browns",
//                 "price": -115,
//                 "point": 7
//               },
//               {
//                 "name": "New England Patriots",
//                 "price": -105,
//                 "point": -7
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "abc4104a9ac597ce37d703613256fd6c",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-10-26T17:00:00Z",
//     "home_team": "Houston Texans",
//     "away_team": "San Francisco 49ers",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Houston Texans",
//                 "price": -110,
//                 "point": -1.5
//               },
//               {
//                 "name": "San Francisco 49ers",
//                 "price": -110,
//                 "point": 1.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "a8ebe01e05675c109b53a97f653f8653",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-10-26T17:00:00Z",
//     "home_team": "Philadelphia Eagles",
//     "away_team": "New York Giants",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "New York Giants",
//                 "price": -120,
//                 "point": 7.5
//               },
//               {
//                 "name": "Philadelphia Eagles",
//                 "price": 100,
//                 "point": -7.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "a8dd9bb0681692540d067bd0e9e66989",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-10-26T20:05:00Z",
//     "home_team": "New Orleans Saints",
//     "away_team": "Tampa Bay Buccaneers",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "New Orleans Saints",
//                 "price": -112,
//                 "point": 4.5
//               },
//               {
//                 "name": "Tampa Bay Buccaneers",
//                 "price": -108,
//                 "point": -4.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "40c2ebd9ddd5ce8ff5b1ada730bb1785",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-10-26T20:25:00Z",
//     "home_team": "Denver Broncos",
//     "away_team": "Dallas Cowboys",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Dallas Cowboys",
//                 "price": -115,
//                 "point": 3.5
//               },
//               {
//                 "name": "Denver Broncos",
//                 "price": -105,
//                 "point": -3.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "88187a33b007c088d75c6cd14c83086c",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-10-26T20:25:00Z",
//     "home_team": "Indianapolis Colts",
//     "away_team": "Tennessee Titans",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Indianapolis Colts",
//                 "price": -112,
//                 "point": -14.5
//               },
//               {
//                 "name": "Tennessee Titans",
//                 "price": -108,
//                 "point": 14.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "fb900eef07307ebf5c1930341ecd852a",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-10-27T00:20:00Z",
//     "home_team": "Pittsburgh Steelers",
//     "away_team": "Green Bay Packers",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Green Bay Packers",
//                 "price": -105,
//                 "point": -3
//               },
//               {
//                 "name": "Pittsburgh Steelers",
//                 "price": -115,
//                 "point": 3
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "7e3361e84d5223a8d210a887b249f247",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-10-28T00:15:00Z",
//     "home_team": "Kansas City Chiefs",
//     "away_team": "Washington Commanders",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Kansas City Chiefs",
//                 "price": -108,
//                 "point": -12.5
//               },
//               {
//                 "name": "Washington Commanders",
//                 "price": -112,
//                 "point": 12.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "677dbbb6ad96fc5f5b36bb20b43139dd",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-10-31T00:15:00Z",
//     "home_team": "Miami Dolphins",
//     "away_team": "Baltimore Ravens",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Baltimore Ravens",
//                 "price": -110,
//                 "point": -7.5
//               },
//               {
//                 "name": "Miami Dolphins",
//                 "price": -110,
//                 "point": 7.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "6dd3b8a705ed0db85d59fa19b9062cc8",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-11-02T18:00:00Z",
//     "home_team": "New England Patriots",
//     "away_team": "Atlanta Falcons",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Atlanta Falcons",
//                 "price": -102,
//                 "point": 2.5
//               },
//               {
//                 "name": "New England Patriots",
//                 "price": -118,
//                 "point": -2.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "6031b513e188fc19a2311499566c9258",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-11-02T18:00:00Z",
//     "home_team": "Green Bay Packers",
//     "away_team": "Carolina Panthers",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Carolina Panthers",
//                 "price": -110,
//                 "point": 10.5
//               },
//               {
//                 "name": "Green Bay Packers",
//                 "price": -110,
//                 "point": -10.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "016f76d8237e8d4eb62b9c2ef68381bb",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-11-02T18:00:00Z",
//     "home_team": "Cincinnati Bengals",
//     "away_team": "Chicago Bears",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Chicago Bears",
//                 "price": -102,
//                 "point": -1.5
//               },
//               {
//                 "name": "Cincinnati Bengals",
//                 "price": -118,
//                 "point": 1.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "72e2ce6652bbb3901f60b38bec05bf5f",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-11-02T18:00:00Z",
//     "home_team": "Houston Texans",
//     "away_team": "Denver Broncos",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Denver Broncos",
//                 "price": -108,
//                 "point": -1.5
//               },
//               {
//                 "name": "Houston Texans",
//                 "price": -112,
//                 "point": 1.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "cf95657d78ab3e515203df1d19c3b0c2",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-11-02T18:00:00Z",
//     "home_team": "Detroit Lions",
//     "away_team": "Minnesota Vikings",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Detroit Lions",
//                 "price": -105,
//                 "point": -8.5
//               },
//               {
//                 "name": "Minnesota Vikings",
//                 "price": -115,
//                 "point": 8.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "2340a6e0794d5688996dcf8aaf634742",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-11-02T18:00:00Z",
//     "home_team": "Pittsburgh Steelers",
//     "away_team": "Indianapolis Colts",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Indianapolis Colts",
//                 "price": -118,
//                 "point": -2.5
//               },
//               {
//                 "name": "Pittsburgh Steelers",
//                 "price": -102,
//                 "point": 2.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "b60025aea576e2e89ef7bc7303f847ec",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-11-02T18:00:00Z",
//     "home_team": "Tennessee Titans",
//     "away_team": "Los Angeles Chargers",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Los Angeles Chargers",
//                 "price": -110,
//                 "point": -8.5
//               },
//               {
//                 "name": "Tennessee Titans",
//                 "price": -110,
//                 "point": 8.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "a788e7cebff4b5fe10034710090e4529",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-11-02T18:00:00Z",
//     "home_team": "New York Giants",
//     "away_team": "San Francisco 49ers",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "New York Giants",
//                 "price": -115,
//                 "point": 3
//               },
//               {
//                 "name": "San Francisco 49ers",
//                 "price": -105,
//                 "point": -3
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "d0bf341e7959d69b55f1a8ff09065234",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-11-02T21:05:00Z",
//     "home_team": "Las Vegas Raiders",
//     "away_team": "Jacksonville Jaguars",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Jacksonville Jaguars",
//                 "price": -108,
//                 "point": -3
//               },
//               {
//                 "name": "Las Vegas Raiders",
//                 "price": -112,
//                 "point": 3
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "b08df670a95f1809707b335dc75081c6",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-11-02T21:05:00Z",
//     "home_team": "Los Angeles Rams",
//     "away_team": "New Orleans Saints",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Los Angeles Rams",
//                 "price": -110,
//                 "point": -12.5
//               },
//               {
//                 "name": "New Orleans Saints",
//                 "price": -110,
//                 "point": 12.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "61531628516decd1ee8116da5f6f9056",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-11-02T21:25:00Z",
//     "home_team": "Buffalo Bills",
//     "away_team": "Kansas City Chiefs",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Buffalo Bills",
//                 "price": -110,
//                 "point": 1.5
//               },
//               {
//                 "name": "Kansas City Chiefs",
//                 "price": -110,
//                 "point": -1.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "c2fd8a23091a954fb21ff6d3537db826",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-11-03T01:20:00Z",
//     "home_team": "Washington Commanders",
//     "away_team": "Seattle Seahawks",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Seattle Seahawks",
//                 "price": -110,
//                 "point": -3
//               },
//               {
//                 "name": "Washington Commanders",
//                 "price": -110,
//                 "point": 3
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   },
//   {
//     "id": "f3dfb574e0a542375a480534525ee6cf",
//     "sport_key": "americanfootball_nfl",
//     "sport_title": "NFL",
//     "commence_time": "2025-11-04T01:15:00Z",
//     "home_team": "Dallas Cowboys",
//     "away_team": "Arizona Cardinals",
//     "bookmakers": [
//       {
//         "key": "draftkings",
//         "title": "DraftKings",
//         "last_update": "2025-10-24T20:46:41Z",
//         "markets": [
//           {
//             "key": "spreads",
//             "last_update": "2025-10-24T20:46:41Z",
//             "outcomes": [
//               {
//                 "name": "Arizona Cardinals",
//                 "price": -118,
//                 "point": 3.5
//               },
//               {
//                 "name": "Dallas Cowboys",
//                 "price": -102,
//                 "point": -3.5
//               }
//             ]
//           }
//         ]
//       }
//     ]
//   }
// ];

// const filteredMatchups = data.filter(game => {
//     const gameStart = new Date(game.commence_time);
//     return gameStart <= endDate;
// });

// console.log(data);
// console.log(filteredMatchups);
