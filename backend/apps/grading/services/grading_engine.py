from decimal import Decimal, ROUND_HALF_UP
from typing import Dict, Any, List, Optional
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError


class GradingEngine:
    """
    Core academic grading and GPA computation engine.
    Calculates continuous weighted marks, translates to the standard 4.00 scale,
    and governs the draft-to-published transcript workflow.
    """

    # Standard North American 4.00 Grade Point Translation Table
    GRADE_SCALE = [
        {"min_percent": Decimal("97.00"), "letter": "A+", "points": Decimal("4.00")},
        {"min_percent": Decimal("93.00"), "letter": "A",  "points": Decimal("4.00")},
        {"min_percent": Decimal("90.00"), "letter": "A-", "points": Decimal("3.70")},
        {"min_percent": Decimal("87.00"), "letter": "B+", "points": Decimal("3.30")},
        {"min_percent": Decimal("83.00"), "letter": "B",  "points": Decimal("3.00")},
        {"min_percent": Decimal("80.00"), "letter": "B-", "points": Decimal("2.70")},
        {"min_percent": Decimal("77.00"), "letter": "C+", "points": Decimal("2.30")},
        {"min_percent": Decimal("73.00"), "letter": "C",  "points": Decimal("2.00")},
        {"min_percent": Decimal("70.00"), "letter": "C-", "points": Decimal("1.70")},
        {"min_percent": Decimal("65.00"), "letter": "D+", "points": Decimal("1.30")},
        {"min_percent": Decimal("60.00"), "letter": "D",  "points": Decimal("1.00")},
        {"min_percent": Decimal("0.00"),  "letter": "F",  "points": Decimal("0.00")},
    ]

    @classmethod
    def percentage_to_grade_points(cls, percentage: Decimal) -> Dict[str, Any]:
        """
        Maps a 0-100 percentage score to a letter grade and 4.0 grade point value.
        """
        clamped = max(Decimal("0.00"), min(Decimal("100.00"), percentage))
        for bracket in cls.GRADE_SCALE:
            if clamped >= bracket["min_percent"]:
                return {
                    "letter_grade": bracket["letter"],
                    "grade_points": bracket["points"],
                    "percentage": clamped.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
                }
        return {"letter_grade": "F", "grade_points": Decimal("0.00"), "percentage": clamped}

    @classmethod
    def calculate_continuous_score(
        cls,
        enrollment_id: str,
        AssessmentModel,
        GradeModel,
        filter_published_only: bool = False
    ) -> Dict[str, Any]:
        """
        Computes the running weighted score for an enrollment:
        Formula: Sum((score_obtained / max_score) * weight_percentage)
        """
        # Fetch assessments for the section
        grades_qs = GradeModel.objects.filter(enrollment_id=enrollment_id).select_related('assessment')
        if filter_published_only:
            grades_qs = grades_qs.filter(assessment__is_published=True)

        total_earned_weight = Decimal("0.00")
        total_possible_weight = Decimal("0.00")
        breakdown = []

        for g in grades_qs:
            asm = g.assessment
            max_s = Decimal(str(asm.max_score))
            score = Decimal(str(g.score_obtained))
            weight = Decimal(str(asm.weight_percentage))

            # Contribution = (score / max_score) * weight
            raw_ratio = score / max_s
            weighted_contrib = (raw_ratio * weight).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

            total_earned_weight += weighted_contrib
            total_possible_weight += weight

            breakdown.append({
                "assessment_id": str(asm.assessment_id),
                "assessment_name": asm.name,
                "score_obtained": float(score),
                "max_score": float(max_s),
                "weight_percentage": float(weight),
                "weighted_contribution": float(weighted_contrib),
                "is_published": asm.is_published
            })

        # Calculate current standing normalized to attempted weight
        if total_possible_weight > Decimal("0.00"):
            current_standing_pct = (
                (total_earned_weight / total_possible_weight) * Decimal("100.00")
            ).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        else:
            current_standing_pct = Decimal("0.00")

        grade_meta = cls.percentage_to_grade_points(current_standing_pct)

        return {
            "total_weighted_percentage": float(total_earned_weight),
            "total_evaluated_weight": float(total_possible_weight),
            "projected_percentage": float(current_standing_pct),
            "projected_letter_grade": grade_meta["letter_grade"],
            "projected_grade_points": float(grade_meta["grade_points"]),
            "breakdown": breakdown
        }

    @classmethod
    def publish_section_final_grades(
        cls,
        section_id: str,
        faculty_id: str,
        SectionModel,
        AssessmentModel,
        EnrollmentModel,
        GradeModel,
        FinalGradeModel,
        StudentModel
    ) -> Dict[str, Any]:
        """
        Finalizes continuous grades into official transcript records.
        Ensures strict 100% total weight verification, generates final_grades rows,
        and triggers student cumulative GPA (CGPA) re-aggregation.
        """
        with transaction.atomic():
            section = SectionModel.objects.select_for_update().get(section_id=section_id)

            # 1. Strict validation: Verify assessment weights sum to exactly 100%
            assessments = AssessmentModel.objects.filter(section_id=section_id)
            total_weight = sum([Decimal(str(a.weight_percentage)) for a in assessments])

            if total_weight != Decimal("100.00"):
                raise ValidationError({
                    "error": "Cannot publish final grades.",
                    "details": f"Section assessment weights sum to {total_weight}%, but must equal exactly 100.00%."
                })

            # Lock the section's assessment syllabus
            section.assessments_locked = True
            section.save()

            # 2. Iterate through enrolled students and compute final grades
            enrollments = EnrollmentModel.objects.filter(section_id=section_id, status='enrolled')
            published_records = []
            affected_student_ids = set()

            for enr in enrollments:
                calc_result = cls.calculate_continuous_score(
                    enrollment_id=enr.enrollment_id,
                    AssessmentModel=AssessmentModel,
                    GradeModel=GradeModel,
                    filter_published_only=False
                )

                final_pct = Decimal(str(calc_result["total_weighted_percentage"]))
                grade_meta = cls.percentage_to_grade_points(final_pct)

                final_grade_obj, _ = FinalGradeModel.objects.update_or_create(
                    enrollment_id=enr.enrollment_id,
                    defaults={
                        "calculated_percentage": grade_meta["percentage"],
                        "letter_grade": grade_meta["letter_grade"],
                        "grade_points": grade_meta["grade_points"],
                        "is_published": True,
                        "published_by_id": faculty_id,
                        "published_at": timezone.now()
                    }
                )

                # Transition enrollment status to completed
                enr.status = 'completed'
                enr.save()

                affected_student_ids.add(enr.student_id)
                published_records.append({
                    "student_id": str(enr.student_id),
                    "percentage": float(grade_meta["percentage"]),
                    "letter_grade": grade_meta["letter_grade"],
                    "grade_points": float(grade_meta["grade_points"])
                })

            # 3. Recalculate CGPA for all affected students
            for s_id in affected_student_ids:
                cls.recompute_student_cgpa(s_id, EnrollmentModel, FinalGradeModel, StudentModel)

            return {
                "message": f"Successfully published final grades for {len(published_records)} students.",
                "published_count": len(published_records),
                "records": published_records
            }

    @classmethod
    def recompute_student_cgpa(cls, student_id: str, EnrollmentModel, FinalGradeModel, StudentModel):
        """
        Recomputes Cumulative GPA (CGPA) across all completed courses:
        CGPA = Sum(grade_points * course.credits) / Sum(course.credits)
        """
        completed = EnrollmentModel.objects.filter(
            student_id=student_id,
            status='completed',
            final_grade__isnull=False,
            final_grade__is_published=True
        ).select_related('section__course', 'final_grade')

        total_quality_points = Decimal("0.00")
        total_credits = Decimal("0.00")

        for enr in completed:
            credits = Decimal(str(enr.section.course.credits))
            points = Decimal(str(enr.final_grade.grade_points))

            total_quality_points += (points * credits)
            total_credits += credits

        cgpa = Decimal("0.00")
        if total_credits > Decimal("0.00"):
            cgpa = (total_quality_points / total_credits).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

        StudentModel.objects.filter(student_id=student_id).update(cumulative_gpa=cgpa)
