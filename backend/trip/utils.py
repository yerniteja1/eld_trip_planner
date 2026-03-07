import requests

ORS_API_KEY = "ORS_API_KEY"

def geocode_location(place_name):
    """
    Takes a place name like 'Chicago, IL'
    Returns {'lat': 41.85, 'lng': -87.65, 'display_name': 'Chicago, IL'}
    """
    url = "https://api.openrouteservice.org/geocode/search"
    
    params = {
        "api_key": ORS_API_KEY,
        "text": place_name,
        "size": 1
    }
    
    try:
        response = requests.get(url, params=params)
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
    url = "https://api.openrouteservice.org/v2/directions/driving-car"
    
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
        response = requests.post(url, json=body, headers=headers)
        response.raise_for_status()
        
        data = response.json()
        
        route = data["routes"][0]
        segment = route["segments"][0]
        
        distance_meters = segment["distance"]
        duration_seconds = segment["duration"]
        
        return {
            "distance_miles": round(distance_meters * 0.000621371, 2),
            "duration_hours": round(duration_seconds / 3600, 2),
            "geometry": route["geometry"]
        }
    
    except Exception as e:
        print(f"Routing error: {e}")
        return None