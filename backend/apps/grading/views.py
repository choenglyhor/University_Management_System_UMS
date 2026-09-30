from decimal import Decimal
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db import transaction
from django.utils import timezone

from apps.core.permissions import (
    IsAdminOrRegistrar, 
    IsDepartmentChair, 
    IsSectionInstructor, 
    IsStudentOwner,
    UserRole
)
from apps.academic.models import CourseSection, Enrollment, Student, Faculty
from apps.grading.models import Assessment, Grade, FinalGrade
from apps.grading.services.grading_engine import GradingEngine
from apps.grading.serializers import AssessmentSerializer, BatchGradesPayloadSerializer

class AcademicGradingViewSet(viewsets.ViewSet):
    """
    Unified API controller handling section rosters, assessment setup,
    batch inline grade entries, and final transcript publication.
    """
    permission_classes = [AllowAny]

    @action(detail=True, methods=['get'], url_path='roster', permission_classes=[AllowAny])
    def get_section_roster(self, request, pk=None):
        """
        GET /api/v1/grading/sections/{id}/roster/
        Returns active roster with assessments, student scores, and projected letter grades.
        """
        section_id = pk
        try:
            section = CourseSection.objects.select_related('course', 'semester', 'faculty').get(section_id=section_id)
        except CourseSection.DoesNotExist:
            return Response({"error": "Section not found."}, status=status.HTTP_404_NOT_FOUND)

        assessments_qs = Assessment.objects.filter(section_id=section_id).order_by('created_at')
        assessments_data = [
            {
                "id": str(a.assessment_id),
                "name": a.name,
                "type": a.type,
                "weight_percentage": float(a.weight_percentage),
                "max_score": float(a.max_score),
                "is_published": a.is_published,
                "due_date": a.due_date.isoformat() if a.due_date else None,
            }
            for a in assessments_qs
        ]

        enrollments_qs = Enrollment.objects.filter(
            section_id=section_id,
            status__in=['enrolled', 'completed']
        ).select_related('student').order_by('student__last_name', 'student__first_name')

        students_data = []
        for enr in enrollments_qs:
            # Fetch continuous scores
            stats = GradingEngine.calculate_continuous_score(
                enrollment_id=enr.enrollment_id,
                AssessmentModel=Assessment,
                GradeModel=Grade,
                filter_published_only=False
            )
            # Map scores dict: assessment_id -> score_obtained
            grades = Grade.objects.filter(enrollment_id=enr.enrollment_id)
            scores_map = {str(g.assessment_id): float(g.score_obtained) for g in grades}

            students_data.append({
                "enrollment_id": str(enr.enrollment_id),
                "student_id": str(enr.student.student_id),
                "student_number": enr.student.student_number,
                "full_name": enr.student.full_name,
                "scores": scores_map,
                "projected_percentage": stats["projected_percentage"],
                "projected_letter_grade": stats["projected_letter_grade"],
                "projected_points": stats["projected_grade_points"],
            })

        return Response({
            "section_id": str(section.section_id),
            "course_code": section.course.course_code,
            "course_title": section.course.title,
            "section_number": section.section_number,
            "assessments_locked": section.assessments_locked,
            "assessments": assessments_data,
            "students": students_data
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='assessments', permission_classes=[IsAuthenticated, IsSectionInstructor])
    def setup_assessment(self, request, pk=None):
        """
        POST /api/v1/grading/sections/{id}/assessments/
        Creates or updates assessments while validating that total weights <= 100%.
        """
        try:
            section = CourseSection.objects.get(section_id=pk)
        except CourseSection.DoesNotExist:
            return Response({"error": "Section not found."}, status=status.HTTP_404_NOT_FOUND)

        if section.assessments_locked:
            return Response({"error": "Assessments are locked for this section."}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        data['section'] = str(section.section_id)

        serializer = AssessmentSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        assessment = serializer.save()

        return Response({
            "message": "Assessment created successfully.",
            "assessment_id": str(assessment.assessment_id),
            "section_id": str(section.section_id),
            "name": assessment.name,
            "weight_percentage": float(assessment.weight_percentage),
            "max_score": float(assessment.max_score)
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post', 'patch'], url_path='grades/batch', permission_classes=[AllowAny])
    def batch_update_grades(self, request, pk=None):
        """
        POST /api/v1/grading/sections/{id}/grades/batch/
        Atomic batch upsert of continuous grades from the spreadsheet matrix.
        """
        serializer = BatchGradesPayloadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        items = serializer.validated_data['items']
        faculty_id = None
        if hasattr(request.user, 'faculty_profile_rel') and request.user.faculty_profile_rel:
            faculty_id = request.user.faculty_profile_rel.faculty_id
        else:
            sec = CourseSection.objects.filter(section_id=pk).first()
            if sec and sec.faculty_id:
                faculty_id = sec.faculty_id
            else:
                first_fac = Faculty.objects.first()
                if first_fac:
                    faculty_id = first_fac.faculty_id

        updated_count = 0
        with transaction.atomic():
            for item in items:
                enr_id = item['enrollment_id']
                asm_id = item['assessment_id']
                score = item['score_obtained']

                asm = Assessment.objects.get(assessment_id=asm_id)
                if score > asm.max_score:
                    return Response({
                        "error": f"Score {score} exceeds maximum allowed {asm.max_score} for assessment {asm.name}."
                    }, status=status.HTTP_400_BAD_REQUEST)

                Grade.objects.update_or_create(
                    enrollment_id=enr_id,
                    assessment_id=asm_id,
                    defaults={
                        'score_obtained': score,
                        'graded_by_id': faculty_id,
                        'updated_at': timezone.now()
                    }
                )
                updated_count += 1

        return Response({
            "message": f"Successfully updated {updated_count} grade entries.",
            "updated_count": updated_count,
            "timestamp": timezone.now().isoformat()
        }, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='publish-final', permission_classes=[AllowAny])
    def publish_final_grades(self, request, pk=None):
        """
        POST /api/v1/grading/sections/{id}/publish-final/
        Finalizes marks, validates weights equal 100%, and publishes to official transcript.
        """
        faculty_id = None
        if hasattr(request.user, 'faculty_profile_rel') and request.user.faculty_profile_rel:
            faculty_id = str(request.user.faculty_profile_rel.faculty_id)
        else:
            sec = CourseSection.objects.filter(section_id=pk).first()
            if sec and sec.faculty_id:
                faculty_id = str(sec.faculty_id)
            else:
                first_fac = Faculty.objects.first()
                if first_fac:
                    faculty_id = str(first_fac.faculty_id)

        result = GradingEngine.publish_section_final_grades(
            section_id=pk,
            faculty_id=faculty_id,
            SectionModel=CourseSection,
            AssessmentModel=Assessment,
            EnrollmentModel=Enrollment,
            GradeModel=Grade,
            FinalGradeModel=FinalGrade,
            StudentModel=Student
        )

        return Response(result, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='student/transcript', permission_classes=[AllowAny])
    def get_student_transcript(self, request):
        """
        GET /api/v1/grading/student/transcript/?student_id={id}
        Returns verified student transcript with CGPA, term breakdown, and courses.
        """
        requested_student_id = request.query_params.get('student_id')
        if request.user.is_authenticated and getattr(request.user, 'role', None) == UserRole.STUDENT and getattr(request.user, 'student_profile_rel', None):
            requested_student_id = str(request.user.student_profile_rel.student_id)

        if not requested_student_id:
            first_student = Student.objects.first()
            if first_student:
                requested_student_id = str(first_student.student_id)
            else:
                return Response({"error": "student_id query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            student = Student.objects.get(student_id=requested_student_id)
        except Student.DoesNotExist:
            return Response({"error": "Student not found."}, status=status.HTTP_404_NOT_FOUND)

        completed_enrollments = Enrollment.objects.filter(
            student_id=requested_student_id,
            final_grade__isnull=False,
            final_grade__is_published=True
        ).select_related('section__course', 'section__semester', 'final_grade')

        terms_map = {}
        total_credits = Decimal('0.0')

        for enr in completed_enrollments:
            sem = enr.section.semester
            term_str = str(sem.term).capitalize() if sem.term else "Semester"
            term_key = f"{term_str} {sem.year}"
            if term_key not in terms_map:
                terms_map[term_key] = {
                    "term": term_key,
                    "term_credits": 0.0,
                    "term_quality_points": Decimal('0.0'),
                    "courses": []
                }

            fg = enr.final_grade
            crs = enr.section.course
            credits = float(crs.credits)
            pts = float(fg.grade_points)

            terms_map[term_key]["term_credits"] += credits
            terms_map[term_key]["term_quality_points"] += Decimal(str(pts)) * Decimal(str(credits))
            terms_map[term_key]["courses"].append({
                "course_code": crs.course_code,
                "course_title": crs.title,
                "credits": credits,
                "calculated_percentage": float(fg.calculated_percentage),
                "letter_grade": fg.letter_grade,
                "grade_points": pts
            })
            total_credits += Decimal(str(credits))

        terms_list = []
        for term_data in terms_map.values():
            t_credits = term_data["term_credits"]
            t_qp = term_data["term_quality_points"]
            term_gpa = float(t_qp / Decimal(str(t_credits))) if t_credits > 0 else 0.0
            terms_list.append({
                "term": term_data["term"],
                "term_gpa": round(term_gpa, 2),
                "term_credits": t_credits,
                "courses": term_data["courses"]
            })

        return Response({
            "student_id": str(student.student_id),
            "student_number": student.student_number,
            "full_name": student.full_name,
            "cumulative_gpa": float(student.cumulative_gpa),
            "total_credits_earned": float(total_credits),
            "terms": terms_list
        }, status=status.HTTP_200_OK)
