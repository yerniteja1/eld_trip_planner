from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils import geocode_location

@api_view(['POST'])
def plan_trip(request):
    data = request.data

    current_location = data.get('current_location', '')
    pickup_location  = data.get('pickup_location', '')
    dropoff_location = data.get('dropoff_location', '')
    cycle_used_hours = data.get('cycle_used_hours', 0)

    current_coords = geocode_location(current_location)
    pickup_coords  = geocode_location(pickup_location)
    dropoff_coords = geocode_location(dropoff_location)

    if not current_coords:
        return Response({"error": f"Could not find location: {current_location}"}, status=400)
    if not pickup_coords:
        return Response({"error": f"Could not find location: {pickup_location}"}, status=400)
    if not dropoff_coords:
        return Response({"error": f"Could not find location: {dropoff_location}"}, status=400)

    return Response({
        "locations": {
            "current":  current_coords,
            "pickup":   pickup_coords,
            "dropoff":  dropoff_coords,
        },
        "status": "ok"
    })