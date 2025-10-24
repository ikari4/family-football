// javascript

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

const date = new Date();
const nflWeek = nflWeeks.find(event => {
    return date >= event.start && date <= event.end;
});

if (nflWeek) {
    console.log('The current NFL Week is week ${nflWeek.week}');
} else {
    console.log('No event found within date.');
}


// fetch('/api/football')
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