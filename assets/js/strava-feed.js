const accessToken = '865a1de0c93dac854330b68eb11b25d59894bb07';  // <-- paste your access token here

fetch('https://www.strava.com/api/v3/athlete/activities?per_page=5', {
  headers: {
    Authorization: 'Bearer ' + accessToken
  }
})
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById('strava-activities');
    container.innerHTML = '';
    data.forEach(activity => {
      const div = document.createElement('div');
      div.style.marginBottom = '1em';
      div.innerHTML = `
        <strong>${activity.name}</strong><br>
        Distance: ${(activity.distance / 1000).toFixed(2)} km<br>
        Time: ${(activity.moving_time / 60).toFixed(0)} min<br>
        <a href="https://www.strava.com/activities/${activity.id}" target="_blank">View on Strava</a>
      `;
      container.appendChild(div);
    });
  })
  .catch(err => {
    document.getElementById('strava-activities').textContent = 'Failed to load activities.';
    console.error(err);
  });
