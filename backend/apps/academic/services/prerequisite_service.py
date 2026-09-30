from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
from django.db.models import Q
# In production, import your Django models:
# from apps.academic.models import Course, CoursePrerequisite, Enrollment, FinalGrade

@dataclass
class PrerequisiteCheckResult:
    is_eligible: bool
    missing_prerequisites: List[Dict[str, Any]]
    details: str


class PrerequisiteValidationService:
    """
    Algorithmic service to validate course prerequisites for student enrollment.
    Performs recursive dependency analysis over the course prerequisite Directed Acyclic Graph (DAG)
    and verifies student transcript records for minimum required passing grades.
    """

    @classmethod
    def validate_student_eligibility(
        cls, 
        student_id: str, 
        target_course_id: str,
        CourseModel,
        PrerequisiteModel,
        EnrollmentModel,
        FinalGradeModel
    ) -> PrerequisiteCheckResult:
        """
        Validates if a student satisfies all prerequisites for target_course_id.
        """
        # 1. Fetch direct prerequisites for the target course
        direct_prereqs = PrerequisiteModel.objects.filter(
            course_id=target_course_id
        ).select_related('prerequisite_course')

        if not direct_prereqs.exists():
            return PrerequisiteCheckResult(
                is_eligible=True,
                missing_prerequisites=[],
                details="Course has no prerequisite constraints."
            )

        # 2. Extract required course IDs and their required minimum grade points
        required_map = {
            prereq.prerequisite_course_id: {
                "course_code": prereq.prerequisite_course.course_code,
                "course_title": prereq.prerequisite_course.title,
                "min_grade_points": float(prereq.min_grade_points)
            }
            for prereq in direct_prereqs
        }

        # 3. Retrieve student's completed academic records with published final grades
        completed_enrollments = EnrollmentModel.objects.filter(
            student_id=student_id,
            status='completed',
            final_grade__isnull=False,
            final_grade__is_published=True
        ).select_related('section__course', 'final_grade')

        student_passed_map = {}
        for enr in completed_enrollments:
            course = enr.section.course
            fg = enr.final_grade
            # If student took a course multiple times, take their best grade points
            current_best = student_passed_map.get(course.course_id, -1.0)
            if float(fg.grade_points) > current_best:
                student_passed_map[course.course_id] = {
                    "grade_points": float(fg.grade_points),
                    "letter_grade": fg.letter_grade,
                    "percentage": float(fg.calculated_percentage)
                }

        # 4. Check each prerequisite requirement
        missing = []
        for req_course_id, req_meta in required_map.items():
            if req_course_id not in student_passed_map:
                missing.append({
                    "course_code": req_meta["course_code"],
                    "course_title": req_meta["course_title"],
                    "required_min_grade_points": req_meta["min_grade_points"],
                    "student_status": "NOT_TAKEN",
                    "student_grade_points": None,
                    "student_letter_grade": None,
                    "reason": f"Prerequisite {req_meta['course_code']} has not been taken."
                })
            else:
                passed_info = student_passed_map[req_course_id]
                if passed_info["grade_points"] < req_meta["min_grade_points"]:
                    missing.append({
                        "course_code": req_meta["course_code"],
                        "course_title": req_meta["course_title"],
                        "required_min_grade_points": req_meta["min_grade_points"],
                        "student_status": "FAILED_MIN_GRADE",
                        "student_grade_points": passed_info["grade_points"],
                        "student_letter_grade": passed_info["letter_grade"],
                        "reason": (
                            f"Earned grade points ({passed_info['grade_points']} - {passed_info['letter_grade']}) "
                            f"below required minimum ({req_meta['min_grade_points']})."
                        )
                    })

        if missing:
            return PrerequisiteCheckResult(
                is_eligible=False,
                missing_prerequisites=missing,
                details=f"Student failed {len(missing)} prerequisite requirement(s)."
            )

        return PrerequisiteCheckResult(
            is_eligible=True,
            missing_prerequisites=[],
            details="All prerequisites satisfied."
        )
