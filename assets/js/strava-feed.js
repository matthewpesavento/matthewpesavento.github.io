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
      const distanceKm = (activity.distance / 1000).toFixed(2);
      const movingMin = (activity.moving_time / 60).toFixed(0);
      const elevationM = activity.total_elevation_gain ? activity.total_elevation_gain.toFixed(0) : 'N/A';
      const date = new Date(activity.start_date_local).toLocaleDateString();

      // Photo thumbnail (sometimes available)
      let photoHtml = '';
      if (activity.photos && activity.photos.primary && activity.photos.primary.urls) {
        // photos.primary.urls is an object with different sizes; take a medium size if available
        const photos = activity.photos.primary.urls;
        // Get first available photo URL
        const photoUrl = photos['600'] || photos['100'] || photos['300'] || Object.values(photos)[0];
        if (photoUrl) {
          photoHtml = `<img src="${photoUrl}" alt="Activity photo" style="max-width: 200px; display:block; margin-bottom:10px;">`;
        }
      }

      const el = document.createElement('div');
      el.style.border = '1px solid #ccc';
      el.style.padding = '10px';
      el.style.marginBottom = '1em';
      el.style.borderRadius = '5px';
      el.innerHTML = `
        <h3>${activity.name}</h3>
        ${photoHtml}
        <p>
          <strong>Date:</strong> ${date}<br>
          <strong>Type:</strong> ${activity.type}<br>
          <strong>Distance:</strong> ${distanceKm} km<br>
          <strong>Moving time:</strong> ${movingMin} min<br>
          <strong>Elevation gain:</strong> ${elevationM} m<br>
          <a href="https://www.strava.com/activities/${activity.id}" target="_blank">View on Strava</a>
        </p>
      `;
      container.appendChild(el);
    });
  })
  .catch(err => {
    const container = document.getElementById('strava-activities');
    container.textContent = 'Failed to load activities.';
    console.error(err);
  });
