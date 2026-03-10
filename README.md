# 🚛 ELD Trip Planner

A full-stack web application that helps truck drivers plan trips in compliance with FMCSA Hours of Service (HOS) regulations. Enter your current location, pickup, and dropoff — get a complete route map, day-by-day schedule, and ELD daily log sheets automatically generated.

**🔗 Live Demo:** https://eld-trip-planner-zeta.vercel.app/

**📦 GitHub:** https://github.com/yerniteja1/eld_trip_planner

---

## Features

- **Live location autocomplete** — powered by OpenRouteService geocoding API
- **Interactive route map** — Leaflet + OpenStreetMap with leg-by-leg polylines and stop markers
- **HOS-compliant scheduling** — full 70hr/8day cycle simulation with automatic rest, break, and fuel stop insertion
- **ELD daily log sheets** — canvas-drawn 24-hour grid matching real FMCSA paper log format
- **Day-by-day schedule** — color-coded segment breakdown per day
- **34-hour restart** — automatically triggered when cycle limit is reached, split correctly across midnight boundaries

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite |
| Map | Leaflet, react-leaflet |
| HTTP | Axios |
| Backend | Django 5, Django REST Framework |
| Routing & Geocoding | OpenRouteService API |
| Hosting (Frontend) | Vercel |
| Hosting (Backend) | Render |

---

## HOS Rules Implemented

| Rule | Value |
|---|---|
| Max driving per shift | 11 hours |
| Max on-duty window per shift | 14 hours |
| Required rest between shifts | 10 hours |
| Mandatory break after driving | 30 min after 8 hrs |
| Weekly cycle limit | 70 hrs / 8 days |
| 34-hour restart | Triggered when cycle exhausted |
| Fuel stop interval | Every 1,000 miles |
| Pickup on-duty time | 1 hour |
| Dropoff on-duty time | 1 hour |
| Each log day | Exactly 24 hours |

---

## Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+
- OpenRouteService API key (free at openrouteservice.org)

---

### Backend

```bash
# Clone the repo
git clone https://github.com/yerniteja1/eld_trip_planner
cd eld_trip_planner/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
echo "SECRET_KEY=your-secret-key-here" > .env
echo "ORS_API_KEY=your-ors-api-key-here" >> .env
echo "DEBUG=True" >> .env

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver
```

Backend runs at: `http://127.0.0.1:8000`

---

### Frontend

```bash
cd eld_trip_planner/frontend

# Install dependencies
npm install

# Create .env file
echo "VITE_API_URL=http://127.0.0.1:8000" > .env
echo "VITE_ORS_API_KEY=your-ors-api-key-here" >> .env

# Start dev server
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## API Reference

### `POST /api/plan-trip/`

**Request body:**
```json
{
  "current_location": "Chicago, IL",
  "pickup_location": "Dallas, TX",
  "dropoff_location": "Los Angeles, CA",
  "cycle_used_hours": 0
}
```

**Response:**
```json
{
  "locations": {
    "current":  { "lat": 41.87, "lng": -87.66, "display_name": "Chicago, IL, USA" },
    "pickup":   { "lat": 32.73, "lng": -96.78, "display_name": "Dallas, TX, USA" },
    "dropoff":  { "lat": 34.05, "lng": -118.25, "display_name": "Los Angeles, CA, USA" }
  },
  "route": {
    "leg1": { "distance_miles": 971.19, "duration_hours": 15.48, "geometry": "..." },
    "leg2": { "distance_miles": 1442.68, "duration_hours": 22.05, "geometry": "..." },
    "total_miles": 2413.87,
    "total_hours": 37.53
  },
  "schedule": [
    [
      { "type": "on_duty_not_driving", "duration": 1.0, "label": "Pickup", "miles": 0 },
      { "type": "driving", "duration": 8.0, "label": "Driving", "miles": 440 },
      ...
    ]
  ],
  "summary": {
    "days": 4,
    "total_driving": 43.89,
    "total_rest": 49.11,
    "total_on_duty": 3.0,
    "day_summaries": [...]
  },
  "status": "ok"
}
```

---

## Architecture

```
Frontend (Vercel)                Backend (Render)
─────────────────                ────────────────────────────────
LocationInput                    /api/plan-trip/
  └─ ORS Autocomplete API   →      geocode_location()  (utils.py)
                                    get_route()         (utils.py)
TripForm                             └─ ORS Directions API
  └─ POST /api/plan-trip/  →      build_schedule()    (hos_engine.py)
                                    summarize_schedule()
MapView                          ↓
  └─ Leaflet + polyline    ←    JSON response
StopsList
  └─ Day cards per segment
ELDLog
  └─ Canvas 24hr grid
```

### HOS Engine Logic

The engine simulates the trip mile by mile at `AVERAGE_SPEED_MPH = 55`. Each iteration of the main loop checks in order:

1. **Cycle limit** — if 70hrs exhausted, trigger 34-hour restart
2. **Shift limits** — if 11hr driving or 14hr window reached, take 10hr rest
3. **Break check** — if 8hrs driven since last break, take 30-min break
4. **Fuel check** — if 1,000 miles since last fuel, stop for fuel
5. **Drive** — advance as far as shift, break, and day boundary allow

All rest segments are split across midnight boundaries so every calendar day equals exactly 24 hours.

---

## Deployment

### Backend — Render
- **Build command:** `./build.sh`
- **Start command:** `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT`
- **Environment variables:** `SECRET_KEY`, `ORS_API_KEY`, `DEBUG`
- **Live URL:** https://eld-trip-planner-7x4r.onrender.com

### Frontend — Vercel
- **Framework:** Vite
- **Environment variables:** `VITE_API_URL`, `VITE_ORS_API_KEY`
- **Live URL:** https://eld-trip-planner-zeta.vercel.app

---

## Project Structure

```
eld_trip_planner/
├── backend/
│   ├── config/
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── trip/
│   │   ├── views.py          # API endpoint
│   │   ├── urls.py
│   │   ├── utils.py          # Geocoding + routing
│   │   └── hos_engine.py     # HOS simulation engine
│   ├── build.sh
│   ├── Procfile
│   └── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx
        └── components/
            ├── TripForm.jsx       # Form with validation
            ├── LocationInput.jsx  # Autocomplete input
            ├── MapView.jsx        # Leaflet route map
            ├── StopsList.jsx      # Day-by-day schedule
            └── ELDLog.jsx         # Canvas ELD log sheet
```

---

## License

MIT
