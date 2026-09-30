from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.core.permissions import (
    IsAdminOrRegistrar,
    IsDepartmentChair,
    IsSectionInstructor,
    IsStudentOwner,
    UserRole
)
from apps.academic.models import (
    Department,
    Faculty,
    Student,
    Course,
    CoursePrerequisite,
    Semester,
    CourseSection,
    Enrollment
)
from apps.grading.models import FinalGrade
from apps.academic.serializers import (
    DepartmentSerializer,
    FacultySerializer,
    StudentSerializer,
    CourseSerializer,
    SemesterSerializer,
    CourseSectionSerializer,
    EnrollmentSerializer,
    EnrollmentRequestSerializer
)
from apps.academic.services.enrollment_service import EnrollmentService
from apps.academic.services.prerequisite_service import PrerequisiteValidationService

class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Department.objects.all().order_by('dept_code')
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]


class FacultyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Faculty.objects.select_related('department').all().order_by('last_name')
    serializer_class = FacultySerializer
    permission_classes = [AllowAny]


class StudentViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Student.objects.select_related('department').all().order_by('student_number')
    serializer_class = StudentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated and getattr(user, 'role', None) == UserRole.STUDENT and hasattr(user, 'student_profile_rel') and user.student_profile_rel:
            return self.queryset.filter(student_id=user.student_profile_rel.student_id)
        return self.queryset


class CourseViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Course.objects.select_related('department').prefetch_related('prerequisites__prerequisite_course').filter(is_active=True).order_by('course_code')
    serializer_class = CourseSerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['get'], url_path='check-prerequisites')
    def check_prerequisites(self, request, pk=None):
        student_id = request.query_params.get('student_id')
        if not student_id and hasattr(request.user, 'student_profile_rel') and request.user.student_profile_rel:
            student_id = str(request.user.student_profile_rel.student_id)

        if not student_id:
            first_student = Student.objects.first()
            if first_student:
                student_id = str(first_student.student_id)
            else:
                return Response({"error": "student_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        result = PrerequisiteValidationService.validate_student_eligibility(
            student_id=student_id,
            target_course_id=pk,
            CourseModel=Course,
            PrerequisiteModel=CoursePrerequisite,
            EnrollmentModel=Enrollment,
            FinalGradeModel=FinalGrade
        )

        return Response({
            "course_id": pk,
            "student_id": student_id,
            "is_eligible": result.is_eligible,
            "missing_prerequisites": result.missing_prerequisites,
            "details": result.details
        })


class CourseSectionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = CourseSection.objects.select_related('course', 'semester', 'faculty').all().order_by('course__course_code', 'section_number')
    serializer_class = CourseSectionSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = self.queryset
        semester_id = self.request.query_params.get('semester_id')
        if semester_id:
            qs = qs.filter(semester_id=semester_id)
        course_id = self.request.query_params.get('course_id')
        if course_id:
            qs = qs.filter(course_id=course_id)
        faculty_id = self.request.query_params.get('faculty_id')
        if faculty_id:
            qs = qs.filter(faculty_id=faculty_id)
        return qs


class EnrollmentViewSet(viewsets.ModelViewSet):
    queryset = Enrollment.objects.select_related('section__course', 'student').all().order_by('-enrolled_at')
    serializer_class = EnrollmentSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        if user and user.is_authenticated:
            if getattr(user, 'role', None) == UserRole.STUDENT and hasattr(user, 'student_profile_rel') and user.student_profile_rel:
                return self.queryset.filter(student_id=user.student_profile_rel.student_id)
            elif getattr(user, 'role', None) == UserRole.FACULTY and hasattr(user, 'faculty_profile_rel') and user.faculty_profile_rel:
                return self.queryset.filter(section__faculty_id=user.faculty_profile_rel.faculty_id)

        student_id = self.request.query_params.get('student_id')
        if student_id:
            return self.queryset.filter(student_id=student_id)
        section_id = self.request.query_params.get('section_id')
        if section_id:
            return self.queryset.filter(section_id=section_id)
        return self.queryset

    @action(detail=False, methods=['post'], url_path='register')
    def register_course(self, request):
        serializer = EnrollmentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        section_id = str(serializer.validated_data['section_id'])
        student_id = serializer.validated_data.get('student_id')

        # If student role, force student profile ID
        if request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == UserRole.STUDENT:
            if hasattr(request.user, 'student_profile_rel') and request.user.student_profile_rel:
                student_id = str(request.user.student_profile_rel.student_id)
            else:
                return Response({"error": "No student profile associated with this account."}, status=status.HTTP_403_FORBIDDEN)
        elif not student_id:
            first_student = Student.objects.first()
            if first_student:
                student_id = str(first_student.student_id)
            else:
                return Response({"error": "student_id is required for administrative registration."}, status=status.HTTP_400_BAD_REQUEST)

        result = EnrollmentService.enroll_student(
            student_id=str(student_id),
            section_id=section_id,
            SectionModel=CourseSection,
            EnrollmentModel=Enrollment,
            PrerequisiteService=PrerequisiteValidationService,
            CourseModel=Course,
            PrerequisiteModel=CoursePrerequisite,
            FinalGradeModel=FinalGrade
        )

        return Response(result, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'], url_path='drop')
    def drop_course(self, request):
        serializer = EnrollmentRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        section_id = str(serializer.validated_data['section_id'])
        student_id = serializer.validated_data.get('student_id')

        if request.user and request.user.is_authenticated and getattr(request.user, 'role', None) == UserRole.STUDENT:
            if hasattr(request.user, 'student_profile_rel') and request.user.student_profile_rel:
                student_id = str(request.user.student_profile_rel.student_id)
            else:
                return Response({"error": "No student profile associated with this account."}, status=status.HTTP_403_FORBIDDEN)
        elif not student_id:
            return Response({"error": "student_id is required."}, status=status.HTTP_400_BAD_REQUEST)

        result = EnrollmentService.drop_student(
            student_id=str(student_id),
            section_id=section_id,
            SectionModel=CourseSection,
            EnrollmentModel=Enrollment
        )

        return Response(result, status=status.HTTP_200_OK)
