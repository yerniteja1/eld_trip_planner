from rest_framework.decorators import api_view
from rest_framework.response import Response
from .utils import geocode_location, get_route
from .hos_engine import build_schedule, summarize_schedule

@api_view(['POST'])
def plan_trip(request):
    data = request.data

    current_location = data.get('current_location', '')
    pickup_location  = data.get('pickup_location', '')
    dropoff_location = data.get('dropoff_location', '')
    cycle_used_hours = float(data.get('cycle_used_hours', 0))

    # Geocode
    current_coords = geocode_location(current_location)
    pickup_coords  = geocode_location(pickup_location)
    dropoff_coords = geocode_location(dropoff_location)

    if not current_coords:
        return Response({"error": f"Could not find: {current_location}"}, status=400)
    if not pickup_coords:
        return Response({"error": f"Could not find: {pickup_location}"}, status=400)
    if not dropoff_coords:
        return Response({"error": f"Could not find: {dropoff_location}"}, status=400)

    # Route
    leg1 = get_route(current_coords, pickup_coords)
    leg2 = get_route(pickup_coords,  dropoff_coords)

    if not leg1:
        return Response({"error": "Could not calculate route to pickup"}, status=400)
    if not leg2:
        return Response({"error": "Could not calculate route to dropoff"}, status=400)

    total_miles = leg1["distance_miles"] + leg2["distance_miles"]

    # HOS Schedule
    schedule = build_schedule(total_miles, cycle_used_hours)
    summary  = summarize_schedule(schedule)

    return Response({
        "locations": {
            "current": current_coords,
            "pickup":  pickup_coords,
            "dropoff": dropoff_coords,
        },
        "route": {
            "leg1":        leg1,
            "leg2":        leg2,
            "total_miles": round(total_miles, 2),
            "total_hours": round(leg1["duration_hours"] +
                                 leg2["duration_hours"], 2),
        },
        "schedule":  schedule,
        "summary":   summary,
        "status":    "ok"
    })