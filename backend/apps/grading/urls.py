from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AcademicGradingViewSet

app_name = 'grading'

router = DefaultRouter()
router.register(r'sections', AcademicGradingViewSet, basename='grading-sections')

urlpatterns = [
    path('', include(router.urls)),
]
