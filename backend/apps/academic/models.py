import uuid
from django.db import models
from django.conf import settings

class Department(models.Model):
    department_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    dept_code = models.CharField(max_length=10, unique=True)
    name = models.CharField(max_length=100, unique=True)
    building = models.CharField(max_length=50, null=True, blank=True)
    office_room = models.CharField(max_length=20, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'departments'
        verbose_name = 'Department'
        verbose_name_plural = 'Departments'

    def __str__(self):
        return f"{self.dept_code} - {self.name}"


class Faculty(models.Model):
    TITLE_CHOICES = [
        ('Instructor', 'Instructor'),
        ('Lecturer', 'Lecturer'),
        ('Assistant Professor', 'Assistant Professor'),
        ('Associate Professor', 'Associate Professor'),
        ('Professor', 'Professor'),
        ('Department Chair', 'Department Chair'),
        ('Dean', 'Dean'),
    ]

    faculty_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department = models.ForeignKey(
        Department,
        on_delete=models.RESTRICT,
        related_name='faculty_members'
    )
    employee_number = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(max_length=120, unique=True)
    title = models.CharField(max_length=30, choices=TITLE_CHOICES, default='Assistant Professor')
    is_active = models.BooleanField(default=True)
    hire_date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'faculty'
        verbose_name = 'Faculty'
        verbose_name_plural = 'Faculty'

    @property
    def user(self):
        from django.contrib.auth import get_user_model
        return get_user_model().objects.filter(email=self.email).first()

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.full_name} ({self.employee_number})"


class Student(models.Model):
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('probation', 'Probation'),
        ('graduated', 'Graduated'),
        ('suspended', 'Suspended'),
        ('withdrawn', 'Withdrawn'),
    ]

    student_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department = models.ForeignKey(
        Department,
        on_delete=models.RESTRICT,
        related_name='students'
    )
    student_number = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(max_length=120, unique=True)
    enrollment_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    admission_date = models.DateField()
    cumulative_gpa = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'students'
        verbose_name = 'Student'
        verbose_name_plural = 'Students'

    @property
    def user(self):
        from django.contrib.auth import get_user_model
        return get_user_model().objects.filter(email=self.email).first()

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"

    def __str__(self):
        return f"{self.full_name} ({self.student_number})"


class Course(models.Model):
    course_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    department = models.ForeignKey(
        Department,
        on_delete=models.RESTRICT,
        related_name='courses'
    )
    course_code = models.CharField(max_length=20, unique=True)
    title = models.CharField(max_length=200)
    description = models.TextField(null=True, blank=True)
    credits = models.DecimalField(max_digits=3, decimal_places=1, default=3.0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'courses'
        verbose_name = 'Course'
        verbose_name_plural = 'Courses'

    def __str__(self):
        return f"{self.course_code}: {self.title}"


class CoursePrerequisite(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name='prerequisites'
    )
    prerequisite_course = models.ForeignKey(
        Course,
        on_delete=models.RESTRICT,
        related_name='required_for_courses'
    )
    min_grade_points = models.DecimalField(max_digits=3, decimal_places=2, default=2.00)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'course_prerequisites'
        unique_together = ('course', 'prerequisite_course')
        verbose_name = 'Course Prerequisite'
        verbose_name_plural = 'Course Prerequisites'

    def __str__(self):
        return f"{self.course.course_code} requires {self.prerequisite_course.course_code} (Min GPA: {self.min_grade_points})"


class Semester(models.Model):
    TERM_CHOICES = [
        ('fall', 'Fall'),
        ('spring', 'Spring'),
        ('summer', 'Summer'),
        ('winter', 'Winter'),
    ]

    semester_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    term = models.CharField(max_length=10, choices=TERM_CHOICES)
    year = models.IntegerField()
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)
    enrollment_open = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'semesters'
        unique_together = ('term', 'year')
        verbose_name = 'Semester'
        verbose_name_plural = 'Semesters'

    def __str__(self):
        term_str = str(self.term).capitalize() if self.term else "Semester"
        return f"{term_str} {self.year}"


class CourseSection(models.Model):
    section_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course,
        on_delete=models.RESTRICT,
        related_name='sections'
    )
    semester = models.ForeignKey(
        Semester,
        on_delete=models.RESTRICT,
        related_name='sections'
    )
    faculty = models.ForeignKey(
        Faculty,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sections'
    )
    section_number = models.CharField(max_length=10)
    capacity = models.IntegerField()
    waitlist_capacity = models.IntegerField(default=10)
    classroom = models.CharField(max_length=50, null=True, blank=True)
    schedule_slot = models.CharField(max_length=100, null=True, blank=True)
    assessments_locked = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'course_sections'
        unique_together = ('course', 'semester', 'section_number')
        verbose_name = 'Course Section'
        verbose_name_plural = 'Course Sections'

    def __str__(self):
        return f"{self.course.course_code}-{self.section_number} ({self.semester})"


class Enrollment(models.Model):
    STATUS_CHOICES = [
        ('enrolled', 'Enrolled'),
        ('waitlisted', 'Waitlisted'),
        ('dropped', 'Dropped'),
        ('completed', 'Completed'),
    ]

    enrollment_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section = models.ForeignKey(
        CourseSection,
        on_delete=models.RESTRICT,
        related_name='enrollments'
    )
    student = models.ForeignKey(
        Student,
        on_delete=models.RESTRICT,
        related_name='enrollments'
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')
    waitlist_position = models.IntegerField(null=True, blank=True)
    enrolled_at = models.DateTimeField(auto_now_add=True)
    dropped_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'enrollments'
        unique_together = ('section', 'student')
        verbose_name = 'Enrollment'
        verbose_name_plural = 'Enrollments'

    def __str__(self):
        return f"{self.student.student_number} in {self.section} ({self.status})"
