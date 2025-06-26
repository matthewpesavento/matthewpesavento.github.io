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

      // Static map using Leaflet
      let mapHtml = '';
      if (detail.map && detail.map.summary_polyline) {
        const mapId = `map-${detail.id}`;
        mapHtml = `<div id="${mapId}" class="strava-leaflet-map"></div>`;

        setTimeout(() => {
          const latLngs = L.Polyline.fromEncoded(detail.map.summary_polyline).getLatLngs();
          const map = L.map(mapId, {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            tap: false
          }).fitBounds(latLngs);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 16
          }).addTo(map);
          L.polyline(latLngs, { color: '#fc4c02', weight: 4 }).addTo(map);
        }, 0);
      }

      // Description
      const description = detail.description ? detail.description : '';

      const el = document.createElement('div');
      el.className = 'strava-card';
      el.innerHTML = `
        <h3><span class="activity-type">${detail.type}</span>: "<span class="activity-name">${detail.name}</span>"</h3>
        ${mapHtml}
        <p class="activity-meta">${date} · ${detail.type}</p>
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
