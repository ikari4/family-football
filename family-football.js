// javascript

// Set weeks of the current NFL season
const nflWeeks = [
    {
        week: 8,
        start: new Date('2025-10-22'),
        end: new Date('2025-10-28')
    },
    {
        week: 9,
        start: new Date('2025-10-29'),
        end: new Date('2025-11-04')
    }
];

// Find which NFL week it is
const date = new Date();
const nflWeek = nflWeeks.find(event => {
    return date >= event.start && date <= event.end;
});

console.log(nflWeek.end.toISOString());
test = new Date(nflWeek.end.toISOString());
console.log(test);

// Call football.js to get odds from API for the current week
// fetch(`/api/football?end=${nflWeek.end}`)
//   .then(response => {
//     if (!response.ok) {
//       throw new Error(`Server error: ${response.status}`);
//     }
//     return response.json();
//   })
//   .then(data => {
//     console.log('NFL odds data:', data);
//   })
//   .catch(error => {
//     console.error('Error:', error);
//   });