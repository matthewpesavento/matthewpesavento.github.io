const accessToken = '865a1de0c93dac854330b68eb11b25d59894bb07';  // <-- your access token here

async function loadActivities() {
  try {
    const res = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=5', {
      headers: { Authorization: 'Bearer ' + accessToken }
    });
    const activities = await res.json();
    const container = document.getElementById('strava-activities');
    container.innerHTML = '';

    for (const activity of activities) {
      // Fetch detailed info for each activity
      const detailRes = await fetch(`https://www.strava.com/api/v3/activities/${activity.id}`, {
        headers: { Authorization: 'Bearer ' + accessToken }
      });
      const detail = await detailRes.json();

      const distanceKm = (detail.distance / 1000).toFixed(2);
      const movingMin = (detail.moving_time / 60).toFixed(0);
      const elevationM = detail.total_elevation_gain ? detail.total_elevation_gain.toFixed(0) : 'N/A';
      const date = new Date(detail.start_date_local).toLocaleDateString();

      // Build photo HTML if available
      let photoHtml = '';
      if (detail.photos && detail.photos.primary && detail.photos.primary.urls) {
        const photos = detail.photos.primary.urls;
        const photoUrl = photos['600'] || photos['100'] || photos['300'] || Object.values(photos)[0];
        if (photoUrl) {
          photoHtml = `<img src="${photoUrl}" alt="Activity photo" style="max-width: 200px; display:block; margin-bottom:10px;">`;
        }
      }

      // Create activity block
      const el = document.createElement('div');
      el.style.border = '1px solid #ccc';
      el.style.padding = '10px';
      el.style.marginBottom = '1em';
      el.style.borderRadius = '5px';
      el.innerHTML = `
        <h3>${detail.name}</h3>
        ${photoHtml}
        <p>
          <strong>Date:</strong> ${date}<br>
          <strong>Type:</strong> ${detail.type}<br>
          <strong>Distance:</strong> ${distanceKm} km<br>
          <strong>Moving time:</strong> ${movingMin} min<br>
          <strong>Elevation gain:</strong> ${elevationM} m<br>
          <a href="https://www.strava.com/activities/${detail.id}" target="_blank" rel="noopener noreferrer">View on Strava</a>
        </p>
      `;
      container.appendChild(el);
    }
  } catch (err) {
    const container = document.getElementById('strava-activities');
    container.textContent = 'Failed to load activities.';
    console.error('Error loading Strava activities:', err);
  }
}

loadActivities();
