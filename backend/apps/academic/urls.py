from django.urls import path, include
from rest_framework.routers import DefaultRouter
from apps.academic.views import (
    DepartmentViewSet,
    FacultyViewSet,
    StudentViewSet,
    CourseViewSet,
    CourseSectionViewSet,
    EnrollmentViewSet
)

app_name = 'academic'

router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'faculty', FacultyViewSet, basename='faculty')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'sections', CourseSectionViewSet, basename='section')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')

urlpatterns = [
    path('', include(router.urls)),
]
