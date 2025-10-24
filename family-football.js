// javascript

fetch('/api/football')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('NFL odds data:', data);
  })
  .catch(error => {
    console.error('Error:', error);
  });