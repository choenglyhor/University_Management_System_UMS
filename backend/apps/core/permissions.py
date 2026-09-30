from rest_framework import permissions

class UserRole:
    ADMIN = 'ADMIN'
    CHAIR = 'CHAIR'
    FACULTY = 'FACULTY'
    STUDENT = 'STUDENT'

    CHOICES = [
        (ADMIN, 'System Admin / Registrar'),
        (CHAIR, 'Department Chair'),
        (FACULTY, 'Faculty / Instructor'),
        (STUDENT, 'Student'),
    ]


class IsAdminOrRegistrar(permissions.BasePermission):
    """
    Allows unrestricted access only to System Admins or Registrars.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            (request.user.role == UserRole.ADMIN or request.user.is_superuser)
        )


class IsDepartmentChair(permissions.BasePermission):
    """
    Department Chair permission. Has elevated department-level access.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [UserRole.ADMIN, UserRole.CHAIR]
        )

    def has_object_permission(self, request, view, obj):
        if request.user.role == UserRole.ADMIN:
            return True
        # Verify object belongs to the chair's department
        dept_id = getattr(obj, 'department_id', None)
        if not dept_id and hasattr(obj, 'course'):
            dept_id = obj.course.department_id
        return dept_id == request.user.faculty_profile.department_id


class IsSectionInstructor(permissions.BasePermission):
    """
    Object-level permission: Faculty can only modify or grade sections 
    where section.faculty_id == user.faculty_profile.faculty_id.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [UserRole.ADMIN, UserRole.CHAIR, UserRole.FACULTY]
        )

    def has_object_permission(self, request, view, obj):
        # Admins have full access
        if request.user.role == UserRole.ADMIN:
            return True

        # Extract section from target object (Section, Assessment, Grade, or FinalGrade)
        section = obj
        if hasattr(obj, 'section'):
            section = obj.section
        elif hasattr(obj, 'assessment'):
            section = obj.assessment.section
        elif hasattr(obj, 'enrollment'):
            section = obj.enrollment.section

        faculty_profile = getattr(request.user, 'faculty_profile', None)
        if not faculty_profile:
            return False

        # Department chair can view/modify sections in their own department
        if request.user.role == UserRole.CHAIR:
            return section.course.department_id == faculty_profile.department_id

        # Faculty must be the assigned instructor
        return section.faculty_id == faculty_profile.faculty_id


class IsStudentOwner(permissions.BasePermission):
    """
    Object-level guard: Students can only query their own enrollments, grades, 
    and published transcripts.
    """
    def has_permission(self, request, view):
        return bool(
            request.user and 
            request.user.is_authenticated and 
            request.user.role in [UserRole.STUDENT, UserRole.ADMIN, UserRole.FACULTY, UserRole.CHAIR]
        )

    def has_object_permission(self, request, view, obj):
        if request.user.role in [UserRole.ADMIN, UserRole.CHAIR]:
            return True

        # Check if user is the student
        student_profile = getattr(request.user, 'student_profile', None)
        if request.user.role == UserRole.STUDENT and student_profile:
            target_student_id = getattr(obj, 'student_id', None)
            if not target_student_id and hasattr(obj, 'enrollment'):
                target_student_id = obj.enrollment.student_id
            return target_student_id == student_profile.student_id

        # Faculty can view student objects in their own sections
        if request.user.role == UserRole.FACULTY:
            faculty_profile = getattr(request.user, 'faculty_profile', None)
            if hasattr(obj, 'section') and faculty_profile:
                return obj.section.faculty_id == faculty_profile.faculty_id

        return False
