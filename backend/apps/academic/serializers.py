from rest_framework import serializers
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

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = '__all__'


class FacultySerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    department_name = serializers.ReadOnlyField(source='department.name')

    class Meta:
        model = Faculty
        fields = '__all__'


class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()
    department_name = serializers.ReadOnlyField(source='department.name')

    class Meta:
        model = Student
        fields = '__all__'


class CoursePrerequisiteSerializer(serializers.ModelSerializer):
    prerequisite_course_code = serializers.ReadOnlyField(source='prerequisite_course.course_code')
    prerequisite_course_title = serializers.ReadOnlyField(source='prerequisite_course.title')

    class Meta:
        model = CoursePrerequisite
        fields = ['course', 'prerequisite_course', 'prerequisite_course_code', 'prerequisite_course_title', 'min_grade_points']


class CourseSerializer(serializers.ModelSerializer):
    department_code = serializers.ReadOnlyField(source='department.dept_code')
    prerequisites = CoursePrerequisiteSerializer(many=True, read_only=True)

    class Meta:
        model = Course
        fields = '__all__'


class SemesterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Semester
        fields = '__all__'


class CourseSectionSerializer(serializers.ModelSerializer):
    course_code = serializers.ReadOnlyField(source='course.course_code')
    course_title = serializers.ReadOnlyField(source='course.title')
    instructor_name = serializers.ReadOnlyField(source='faculty.full_name')
    semester_name = serializers.SerializerMethodField()
    enrolled_count = serializers.SerializerMethodField()
    waitlist_count = serializers.SerializerMethodField()

    class Meta:
        model = CourseSection
        fields = '__all__'

    def get_semester_name(self, obj):
        return f"{obj.semester.term.capitalize()} {obj.semester.year}"

    def get_enrolled_count(self, obj):
        return obj.enrollments.filter(status='enrolled').count()

    def get_waitlist_count(self, obj):
        return obj.enrollments.filter(status='waitlisted').count()


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.ReadOnlyField(source='student.full_name')
    student_number = serializers.ReadOnlyField(source='student.student_number')
    course_code = serializers.ReadOnlyField(source='section.course.course_code')
    course_title = serializers.ReadOnlyField(source='section.course.title')
    section_number = serializers.ReadOnlyField(source='section.section_number')

    class Meta:
        model = Enrollment
        fields = '__all__'


class EnrollmentRequestSerializer(serializers.Serializer):
    section_id = serializers.UUIDField(required=True)
    student_id = serializers.UUIDField(required=False)
