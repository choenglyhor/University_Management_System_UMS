import logging
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError, APIException

logger = logging.getLogger(__name__)

class ConflictError(APIException):
    status_code = 409
    default_detail = "Conflict occurred with resource state."
    default_code = "conflict"


class EnrollmentService:
    """
    High-concurrency enrollment engine handling race conditions, 
    atomic capacity counters, and automatic waitlist queues.
    """

    @classmethod
    def enroll_student(
        cls, 
        student_id: str, 
        section_id: str,
        SectionModel,
        EnrollmentModel,
        PrerequisiteService,
        CourseModel,
        PrerequisiteModel,
        FinalGradeModel
    ):
        """
        Executes an atomic enrollment attempt with pessimistic row-locking
        to prevent over-enrollment races during registration spikes.
        """
        with transaction.atomic():
            # 1. Acquire pessimistic lock on the target section row
            # On Microsoft SQL Server, select_for_update() maps to 'WITH (UPDLOCK, ROWLOCK)'
            try:
                section = SectionModel.objects.select_for_update().select_related('course', 'semester').get(
                    section_id=section_id
                )
            except SectionModel.DoesNotExist:
                raise ValidationError({"section_id": "Section does not exist."})

            # 2. Check if semester enrollment is open
            if not section.semester.is_active or not section.semester.enrollment_open:
                raise ConflictError("Enrollment is closed for this semester.")

            # 3. Check duplicate enrollment in this section
            existing_enrollment = EnrollmentModel.objects.filter(
                section_id=section_id,
                student_id=student_id
            ).first()

            if existing_enrollment:
                if existing_enrollment.status in ['enrolled', 'waitlisted']:
                    raise ConflictError(
                        f"Student is already {existing_enrollment.status} in this section."
                    )
                # If previously dropped, we will re-activate under the locked state

            # 4. Check if student is already enrolled in another section of the same course in the same semester
            duplicate_course_enr = EnrollmentModel.objects.filter(
                student_id=student_id,
                section__course_id=section.course_id,
                section__semester_id=section.semester_id,
                status__in=['enrolled', 'waitlisted']
            ).exclude(section_id=section_id).exists()

            if duplicate_course_enr:
                raise ConflictError(
                    f"Student is already registered for course {section.course.course_code} in another section for this semester."
                )

            # 5. Algorithmic prerequisite validation check
            prereq_result = PrerequisiteService.validate_student_eligibility(
                student_id=student_id,
                target_course_id=section.course_id,
                CourseModel=CourseModel,
                PrerequisiteModel=PrerequisiteModel,
                EnrollmentModel=EnrollmentModel,
                FinalGradeModel=FinalGradeModel
            )

            if not prereq_result.is_eligible:
                raise ValidationError({
                    "error": "Prerequisite requirements not satisfied.",
                    "details": prereq_result.missing_prerequisites
                })

            # 6. Evaluate live capacity under pessimistic lock
            enrolled_count = EnrollmentModel.objects.filter(
                section_id=section_id,
                status='enrolled'
            ).count()

            if enrolled_count < section.capacity:
                # Direct Seat Available
                if existing_enrollment:
                    existing_enrollment.status = 'enrolled'
                    existing_enrollment.waitlist_position = None
                    existing_enrollment.enrolled_at = timezone.now()
                    existing_enrollment.dropped_at = None
                    existing_enrollment.save()
                    enrollment = existing_enrollment
                else:
                    enrollment = EnrollmentModel.objects.create(
                        section_id=section_id,
                        student_id=student_id,
                        status='enrolled',
                        waitlist_position=None,
                        enrolled_at=timezone.now()
                    )

                logger.info(f"Student {student_id} successfully enrolled in section {section_id}.")
                return {
                    "status": "enrolled",
                    "enrollment_id": str(enrollment.enrollment_id),
                    "waitlist_position": None,
                    "message": "Enrolled successfully into regular section capacity."
                }

            # 7. Regular capacity full; check waitlist capacity
            waitlist_count = EnrollmentModel.objects.filter(
                section_id=section_id,
                status='waitlisted'
            ).count()

            if waitlist_count < section.waitlist_capacity:
                next_position = waitlist_count + 1

                if existing_enrollment:
                    existing_enrollment.status = 'waitlisted'
                    existing_enrollment.waitlist_position = next_position
                    existing_enrollment.enrolled_at = timezone.now()
                    existing_enrollment.dropped_at = None
                    existing_enrollment.save()
                    enrollment = existing_enrollment
                else:
                    enrollment = EnrollmentModel.objects.create(
                        section_id=section_id,
                        student_id=student_id,
                        status='waitlisted',
                        waitlist_position=next_position,
                        enrolled_at=timezone.now()
                    )

                logger.info(f"Student {student_id} placed on waitlist position #{next_position} for section {section_id}.")
                return {
                    "status": "waitlisted",
                    "enrollment_id": str(enrollment.enrollment_id),
                    "waitlist_position": next_position,
                    "message": f"Section is full. Student placed on waitlist at position #{next_position}."
                }

            # 8. Both section capacity and waitlist capacity are exhausted
            raise ConflictError(
                f"Course section {section.course.course_code}-{section.section_number} is completely full (Capacity: {section.capacity}, Waitlist: {section.waitlist_capacity})."
            )

    @classmethod
    def drop_student(cls, student_id: str, section_id: str, SectionModel, EnrollmentModel):
        """
        Drops a student from an enrolled or waitlisted seat and triggers
        concurrency-safe waitlist promotion.
        """
        with transaction.atomic():
            section = SectionModel.objects.select_for_update().get(section_id=section_id)
            enrollment = EnrollmentModel.objects.select_for_update().get(
                section_id=section_id,
                student_id=student_id,
                status__in=['enrolled', 'waitlisted']
            )

            previous_status = enrollment.status
            enrollment.status = 'dropped'
            enrollment.waitlist_position = None
            enrollment.dropped_at = timezone.now()
            enrollment.save()

            if previous_status == 'enrolled':
                # Promote top waitlist student
                top_waitlist = EnrollmentModel.objects.select_for_update().filter(
                    section_id=section_id,
                    status='waitlisted'
                ).order_by('waitlist_position').first()

                if top_waitlist:
                    top_waitlist.status = 'enrolled'
                    top_waitlist.waitlist_position = None
                    top_waitlist.save()
                    logger.info(f"Promoted waitlist student {top_waitlist.student_id} to enrolled in section {section_id}.")

                    # Reorder remaining waitlist
                    remaining = EnrollmentModel.objects.select_for_update().filter(
                        section_id=section_id,
                        status='waitlisted'
                    ).order_by('waitlist_position')
                    for index, item in enumerate(remaining, start=1):
                        item.waitlist_position = index
                        item.save()

            elif previous_status == 'waitlisted':
                # Reorder remaining waitlist
                remaining = EnrollmentModel.objects.select_for_update().filter(
                    section_id=section_id,
                    status='waitlisted'
                ).order_by('waitlist_position')
                for index, item in enumerate(remaining, start=1):
                    item.waitlist_position = index
                    item.save()

            return {"message": "Enrollment dropped successfully."}
