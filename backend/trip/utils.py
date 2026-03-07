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