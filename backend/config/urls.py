from django.contrib import admin
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
from apps.grading.views import AcademicGradingViewSet

# Unified API router
router = DefaultRouter()
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'faculty', FacultyViewSet, basename='faculty')
router.register(r'students', StudentViewSet, basename='student')
router.register(r'courses', CourseViewSet, basename='course')
router.register(r'sections', CourseSectionViewSet, basename='section')
router.register(r'enrollments', EnrollmentViewSet, basename='enrollment')
router.register(r'grading/sections', AcademicGradingViewSet, basename='grading-section')

# Direct transcript view helper mapping
transcript_view = AcademicGradingViewSet.as_view({'get': 'get_student_transcript'})

urlpatterns = [
    path('admin/', admin.site.urls),
    # Authentication endpoints
    path('api/v1/auth/', include('apps.core.urls')),
    # Direct aliases for student transcript
    path('api/v1/student/transcript/', transcript_view, name='student-transcript-direct'),
    path('api/v1/grading/student/transcript/', transcript_view, name='grading-student-transcript-direct'),
    # API endpoints
    path('api/v1/', include(router.urls)),
]
