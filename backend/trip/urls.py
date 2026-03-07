from django.urls import path
from . import views

urlpatterns = [
    path('api/plan-trip/', views.plan_trip),
]