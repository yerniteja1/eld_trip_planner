import { useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  useMap
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// ── Fix Leaflet default icon issue with Vite ──────────
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

// ── Custom colored markers ─────────────────────────────
function coloredIcon(color) {
  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 28px;
        height: 28px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      "></div>
    `,
    iconSize:   [28, 28],
    iconAnchor: [14, 14],
  })
}

// ── Decode Google-style encoded polyline ──────────────
function decodePolyline(encoded) {
  const points = []
  let index = 0
  let lat = 0
  let lng = 0

  while (index < encoded.length) {
    let shift = 0
    let result = 0
    let byte

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    lat += (result & 1) ? ~(result >> 1) : result >> 1

    shift = 0
    result = 0

    do {
      byte = encoded.charCodeAt(index++) - 63
      result |= (byte & 0x1f) << shift
      shift += 5
    } while (byte >= 0x20)

    lng += (result & 1) ? ~(result >> 1) : result >> 1

    points.push([lat / 1e5, lng / 1e5])
  }

  return points
}

// ── Auto-fit map to route bounds ──────────────────────
function FitBounds({ positions }) {
  const map = useMap()
  useEffect(() => {
    if (positions.length > 0) {
      map.fitBounds(positions, { padding: [40, 40] })
    }
  }, [positions])
  return null
}

// ── Main MapView Component ────────────────────────────
export default function MapView({ routeData, locations }) {
  const leg1Points = decodePolyline(routeData.leg1.geometry)
  const leg2Points = decodePolyline(routeData.leg2.geometry)

  const allPoints = [...leg1Points, ...leg2Points]

  const current  = [locations.current.lat,  locations.current.lng]
  const pickup   = [locations.pickup.lat,   locations.pickup.lng]
  const dropoff  = [locations.dropoff.lat,  locations.dropoff.lng]

  return (
    <div style={{
      borderRadius: '10px',
      overflow:     'hidden',
      boxShadow:    '0 2px 8px rgba(0,0,0,0.15)'
    }}>
      <MapContainer
        center={[39.5, -98.35]}
        zoom={5}
        style={{ height: '480px', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds positions={allPoints} />

        {/* Route lines */}
        <Polyline
          positions={leg1Points}
          color="#3b82f6"
          weight={4}
          opacity={0.8}
        />
        <Polyline
          positions={leg2Points}
          color="#f59e0b"
          weight={4}
          opacity={0.8}
        />

        {/* Current location marker — green */}
        <Marker position={current} icon={coloredIcon('#22c55e')}>
          <Popup>
            <strong>📍 Current Location</strong>
            <br />
            {locations.current.display_name}
          </Popup>
        </Marker>

        {/* Pickup marker — blue */}
        <Marker position={pickup} icon={coloredIcon('#3b82f6')}>
          <Popup>
            <strong>📦 Pickup</strong>
            <br />
            {locations.pickup.display_name}
            <br />
            <small>
              {routeData.leg1.distance_miles} mi —{' '}
              {routeData.leg1.duration_hours} hrs from current
            </small>
          </Popup>
        </Marker>

        {/* Dropoff marker — red */}
        <Marker position={dropoff} icon={coloredIcon('#ef4444')}>
          <Popup>
            <strong>🏁 Dropoff</strong>
            <br />
            {locations.dropoff.display_name}
            <br />
            <small>
              {routeData.leg2.distance_miles} mi —{' '}
              {routeData.leg2.duration_hours} hrs from pickup
            </small>
          </Popup>
        </Marker>

      </MapContainer>

      {/* Legend */}
      <div style={{
        display:        'flex',
        gap:            '24px',
        padding:        '12px 16px',
        background:     '#fff',
        borderTop:      '1px solid #eee',
        fontSize:       '13px'
      }}>
        <span>
          <span style={{
            display:      'inline-block',
            width:        '12px',
            height:       '12px',
            background:   '#22c55e',
            borderRadius: '50%',
            marginRight:  '6px'
          }}/>
          Current Location
        </span>
        <span>
          <span style={{
            display:      'inline-block',
            width:        '12px',
            height:       '12px',
            background:   '#3b82f6',
            borderRadius: '50%',
            marginRight:  '6px'
          }}/>
          Pickup
        </span>
        <span>
          <span style={{
            display:      'inline-block',
            width:        '12px',
            height:       '12px',
            background:   '#ef4444',
            borderRadius: '50%',
            marginRight:  '6px'
          }}/>
          Dropoff
        </span>
        <span style={{ marginLeft: 'auto', color: '#666' }}>
          Total: {routeData.total_miles} miles —{' '}
          {routeData.total_hours} hrs driving
        </span>
      </div>
    </div>
  )
}