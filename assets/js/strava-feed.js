const accessToken = '865a1de0c93dac854330b68eb11b25d59894bb07';

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
      const paceFormatted = formatPace(detail.moving_time / (detail.distance / 1000));
      const avgSpeedKmh = detail.average_speed ? (detail.average_speed * 3.6).toFixed(2) : 'N/A';
      const loc = detail.start_city ? detail.start_city + (detail.start_state ? ', ' + detail.start_state : '') : 'Unknown';
      const description = detail.description || '';

      const mapId = `map-${detail.id}`;
      const card = document.createElement('div');
      card.className = 'strava-card';
      card.innerHTML = `
        <h3><span class="activity-type">${detail.type}</span>: “${detail.name}”</h3>
        <div id="${mapId}" class="strava-leaflet-map"></div>
        <p class="activity-meta">${date} · ${detail.type} · ${loc}</p>
        <p class="activity-description">${description || '<em>No description</em>'}</p>
        <ul class="activity-stats">
          <li><strong>Distance:</strong> ${distanceKm} km</li>
          <li><strong>Time:</strong> ${movingMin} min</li>
          <li><strong>Pace:</strong> ${paceFormatted}</li>
          <li><strong>Speed:</strong> ${avgSpeedKmh} km/h</li>
          <li><strong>Elevation:</strong> ${elevationM} m</li>
        </ul>
        <a class="strava-link" href="https://www.strava.com/activities/${detail.id}" target="_blank">View on Strava →</a>
      `;
      container.appendChild(card);

      if (detail.map && detail.map.summary_polyline) {
        const coords = polyline.decode(detail.map.summary_polyline);
        const latLngs = coords.map(([lat, lon]) => [lat, lon]);
        const map = L.map(mapId, { zoomControl: false, attributionControl: false }).fitBounds(latLngs);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
        L.polyline(latLngs, { color: '#fc4c02', weight: 3 }).addTo(map);
      }
    }
  } catch (err) {
    document.getElementById('strava-activities').textContent = 'Failed to load activities.';
    console.error(err);
  }
}

document.addEventListener('DOMContentLoaded', loadActivities);
