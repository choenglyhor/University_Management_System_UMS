import uuid
from django.db import models
from apps.academic.models import CourseSection, Enrollment, Faculty

class Assessment(models.Model):
    TYPE_CHOICES = [
        ('assignment', 'Assignment'),
        ('quiz', 'Quiz'),
        ('midterm', 'Midterm Exam'),
        ('final', 'Final Exam'),
        ('project', 'Project'),
        ('participation', 'Participation'),
    ]

    assessment_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    section = models.ForeignKey(
        CourseSection,
        on_delete=models.CASCADE,
        related_name='assessments'
    )
    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    weight_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    max_score = models.DecimalField(max_digits=6, decimal_places=2)
    due_date = models.DateTimeField(null=True, blank=True)
    is_published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'assessments'
        unique_together = ('section', 'name')
        verbose_name = 'Assessment'
        verbose_name_plural = 'Assessments'

    def __str__(self):
        return f"{self.name} ({self.weight_percentage}%) - {self.section}"


class Grade(models.Model):
    grade_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.ForeignKey(
        Enrollment,
        on_delete=models.CASCADE,
        related_name='grades'
    )
    assessment = models.ForeignKey(
        Assessment,
        on_delete=models.RESTRICT,
        related_name='grades'
    )
    score_obtained = models.DecimalField(max_digits=6, decimal_places=2)
    feedback = models.TextField(null=True, blank=True)
    graded_by = models.ForeignKey(
        Faculty,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column='graded_by',
        related_name='given_grades'
    )
    graded_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'grades'
        unique_together = ('enrollment', 'assessment')
        verbose_name = 'Grade'
        verbose_name_plural = 'Grades'

    def __str__(self):
        return f"{self.enrollment.student.student_number} - {self.assessment.name}: {self.score_obtained}"


class FinalGrade(models.Model):
    LETTER_GRADE_CHOICES = [
        ('A+', 'A+'), ('A', 'A'), ('A-', 'A-'),
        ('B+', 'B+'), ('B', 'B'), ('B-', 'B-'),
        ('C+', 'C+'), ('C', 'C'), ('C-', 'C-'),
        ('D+', 'D+'), ('D', 'D'), ('F', 'F'),
    ]

    final_grade_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    enrollment = models.OneToOneField(
        Enrollment,
        on_delete=models.CASCADE,
        related_name='final_grade'
    )
    calculated_percentage = models.DecimalField(max_digits=5, decimal_places=2)
    letter_grade = models.CharField(max_length=3, choices=LETTER_GRADE_CHOICES)
    grade_points = models.DecimalField(max_digits=3, decimal_places=2)
    is_published = models.BooleanField(default=False)
    published_by = models.ForeignKey(
        Faculty,
        on_delete=models.RESTRICT,
        null=True,
        blank=True,
        db_column='published_by',
        related_name='published_final_grades'
    )
    published_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'final_grades'
        verbose_name = 'Final Grade'
        verbose_name_plural = 'Final Grades'

    def __str__(self):
        return f"{self.enrollment}: {self.letter_grade} ({self.grade_points})"
