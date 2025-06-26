const accessToken = '865a1de0c93dac854330b68eb11b25d59894bb07';  // <-- your Strava access token

function formatPace(secondsPerKm) {
  if (!secondsPerKm || secondsPerKm === Infinity) return 'N/A';
  const minutes = Math.floor(secondsPerKm / 60);
  const seconds = Math.round(secondsPerKm % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')} min/km`;
}

async function loadActivities() {
  try {
    const res = await fetch('https://www.strava.com/api/v3/athlete/activities?per_page=5', {
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

      // Create unique map container ID for each activity
      const mapId = `map-${detail.id}`;

      // Create card container
      const el = document.createElement('div');
      el.className = 'strava-card';
      el.innerHTML = `
        <div id="${mapId}" class="strava-leaflet-map"></div>
        <div class="strava-info">
          <h3 class="activity-title">${detail.name}</h3>
          <p class="activity-meta">${date} · ${detail.type} · ${location}</p>
          <ul class="activity-stats">
            <li><strong>Distance:</strong> ${distanceKm} km</li>
            <li><strong>Time:</strong> ${movingMin} min</li>
            <li><strong>Pace:</strong> ${paceFormatted}</li>
            <li><strong>Speed:</strong> ${avgSpeedKmh} km/h</li>
            <li><strong>Elevation:</strong> ${elevationM} m</li>
          </ul>
          <a class="strava-link" href="https://www.strava.com/activities/${detail.id}" target="_blank" rel="noopener noreferrer">View on Strava →</a>
        </div>
      `;
      container.appendChild(el);

      // Add interactive Leaflet map if polyline available
      if (detail.map && detail.map.summary_polyline) {
        const coords = polyline.decode(detail.map.summary_polyline);
        const latLngs = coords.map(([lat, lng]) => [lat, lng]);

        const map = L.map(mapId, {
          zoomControl: false,
          attributionControl: false
        }).setView(latLngs[0], 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        L.polyline(latLngs, {
          color: '#fc4c02',
          weight: 4,
          opacity: 0.9
        }).addTo(map);

        map.fitBounds(latLngs);
      }
    }
  } catch (err) {
    const container = document.getElementById('strava-activities');
    container.textContent = 'Failed to load activities.';
    console.error('Error loading Strava activities:', err);
  }
}

document.addEventListener('DOMContentLoaded', loadActivities);
