import requests
from django.conf import settings

ORS_API_KEY = settings.ORS_API_KEY
ORS_GEOCODE_URL = settings.ORS_GEOCODE_URL
ORS_DIRECTIONS_URL = settings.ORS_DIRECTIONS_URL

def geocode_location(place_name):
    """ Takes a place name like 'Chicago, IL' Returns {'lat': 41.85, 'lng': -87.65, 'display_name': 'Chicago, IL'} """
    
    params = {
        "api_key": ORS_API_KEY,
        "text": place_name,
        "size": 1
    }
    
    try:
        response = requests.get(ORS_GEOCODE_URL, params=params)
        response.raise_for_status()
        
        data = response.json()
        
        if not data["features"]:
            return None
        
        coords = data["features"][0]["geometry"]["coordinates"]
        label = data["features"][0]["properties"]["label"]
        
        return {
            "lng": coords[0],
            "lat": coords[1],
            "display_name": label
        }
    
    except Exception as e:
        print(f"Geocoding error for '{place_name}': {e}")
        return None
  
def get_route(origin, destination):
    """
    Takes two coordinate dicts {'lat': ..., 'lng': ...}
    Returns distance in miles, duration in hours, and route geometry
    """
    
    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json"
    }
    
    body = {
        "coordinates": [
            [origin["lng"], origin["lat"]],
            [destination["lng"], destination["lat"]]
        ]
    }
    
    try:
        response = requests.post(ORS_DIRECTIONS_URL, json=body, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        route = data["routes"][0]
        segment = route["segments"][0]
        
        distance_meters = segment["distance"]
        duration_seconds = segment["duration"]
        
        return {
            "distance_miles": round(distance_meters * 0.000621371, 2),
            "duration_hours": round(duration_seconds / 3600, 2),
            "geometry": route["geometry"]  # encoded polyline for map
        }
    
    except Exception as e:
        print(f"Routing error: {e}")
        return None
    
