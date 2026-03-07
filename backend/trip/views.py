from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils import geocode_location, get_route

@api_view(['POST'])
def plan_trip(request):
    data = request.data

    current_location = data.get('current_location', '')
    pickup_location  = data.get('pickup_location', '')
    dropoff_location = data.get('dropoff_location', '')
    cycle_used_hours = data.get('cycle_used_hours', 0)

    # Step 1: Geocode all 3 locations
    current_coords = geocode_location(current_location)
    pickup_coords  = geocode_location(pickup_location)
    dropoff_coords = geocode_location(dropoff_location)

    if not current_coords:
        return Response({"error": f"Could not find: {current_location}"}, status=400)
    if not pickup_coords:
        return Response({"error": f"Could not find: {pickup_location}"}, status=400)
    if not dropoff_coords:
        return Response({"error": f"Could not find: {dropoff_location}"}, status=400)

    # Step 2: Get routes
    # Leg 1: Current location → Pickup
    leg1 = get_route(current_coords, pickup_coords)
    # Leg 2: Pickup → Dropoff
    leg2 = get_route(pickup_coords, dropoff_coords)

    if not leg1:
        return Response({"error": "Could not calculate route to pickup"}, status=400)
    if not leg2:
        return Response({"error": "Could not calculate route to dropoff"}, status=400)

    total_miles = round(leg1["distance_miles"] + leg2["distance_miles"], 2)
    total_hours = round(leg1["duration_hours"] + leg2["duration_hours"], 2)

    return Response({
        "locations": {
            "current":  current_coords,
            "pickup":   pickup_coords,
            "dropoff":  dropoff_coords,
        },
        "route": {
            "leg1": {
                "from": current_location,
                "to":   pickup_location,
                "distance_miles": leg1["distance_miles"],
                "duration_hours": leg1["duration_hours"],
                "geometry":       leg1["geometry"]
            },
            "leg2": {
                "from": pickup_location,
                "to":   dropoff_location,
                "distance_miles": leg2["distance_miles"],
                "duration_hours": leg2["duration_hours"],
                "geometry":       leg2["geometry"]
            },
            "total_miles": total_miles,
            "total_hours": total_hours,
        },
        "status": "ok"
    })