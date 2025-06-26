const accessToken = '865a1de0c93dac854330b68eb11b25d59894bb07';  // <-- your Strava access token

function formatPace(secondsPerKm) {
  if (!secondsPerKm || secondsPerKm === Infinity) return 'N/A';
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
}

async function loadActivities() {
  try {
    const res = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=6', {
      headers: { Authorization: 'Bearer ' + accessToken }
    });
    const activities = await res.json();
    const container = document.getElementById('strava-activities');
    container.innerHTML = '';

    for (const activity of activities) {
      const detailRes = await fetch(`https://www.strava.com/api/v3/activities/${activity.id}`, {
        headers: { Authorization: 'Bearer ' + accessToken }
      });
      const detail = await detailRes.json();

      const distanceKm = (detail.distance / 1000).toFixed(2);
      const movingMin = (detail.moving_time / 60).toFixed(0);
      const elevationM = detail.total_elevation_gain ? detail.total_elevation_gain.toFixed(0) : 'N/A';
      const date = new Date(detail.start_date_local).toLocaleDateString();

      // Pace calculation
      const paceSecPerKm = detail.moving_time / (detail.distance / 1000);
      const paceFormatted = formatPace(paceSecPerKm);

      // Average speed in km/h
      const avgSpeedKmh = detail.average_speed ? (detail.average_speed * 3.6).toFixed(2) : 'N/A';

      // Location
      const locationParts = [];
      if (detail.start_city) locationParts.push(detail.start_city);
      if (detail.start_state) locationParts.push(detail.start_state);
      const location = locationParts.length > 0 ? locationParts.join(', ') : 'Unknown';

      // Static map from Strava preview image
      let mapHtml = '';
      if (detail.map && detail.map.summary_polyline) {
        const staticMapUrl = `https://maps.strava.com/tiles-auth/ride/${detail.map.id}/summary/300/300.png?access_token=${accessToken}`;
        mapHtml = `<img src="${staticMapUrl}" alt="Activity map" class="strava-leaflet-map" />`;
      }

      // Description
      const description = detail.description ? detail.description : '';

      const el = document.createElement('div');
      el.className = 'strava-card';
      el.innerHTML = `
        <h3><span class="activity-type">${detail.type}</span>: ${detail.name}</h3>
        ${mapHtml}
        <p class="activity-meta">${date} · ${detail.type} · ${location}</p>
        <p class="activity-description">${description ? description : '<em>No description</em>'}</p>
        <ul class="activity-stats">
          <li><strong>Distance:</strong> ${distanceKm} km</li>
          <li><strong>Time:</strong> ${movingMin} min</li>
          <li><strong>Pace:</strong> ${paceFormatted}</li>
          <li><strong>Speed:</strong> ${avgSpeedKmh} km/h</li>
          <li><strong>Elevation:</strong> ${elevationM} m</li>
        </ul>
        <a href="https://www.strava.com/activities/${detail.id}" target="_blank" rel="noopener noreferrer" class="strava-link">View on Strava →</a>
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
