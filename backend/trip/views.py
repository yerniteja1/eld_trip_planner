from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def plan_trip(request):
    data = request.data

    current_location = data.get('current_location', '')
    pickup_location  = data.get('pickup_location', '')
    dropoff_location = data.get('dropoff_location', '')
    cycle_used_hours = data.get('cycle_used_hours', 0)

    return Response({
        "received": {
            "current_location": current_location,
            "pickup_location":  pickup_location,
            "dropoff_location": dropoff_location,
            "cycle_used_hours": cycle_used_hours,
        },
        "status": "ok"
    })