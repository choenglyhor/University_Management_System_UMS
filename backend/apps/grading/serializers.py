from rest_framework import serializers
from decimal import Decimal
from apps.grading.models import Assessment, Grade, FinalGrade

class AssessmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Assessment
        fields = '__all__'

    def validate(self, attrs):
        section = attrs.get('section')
        weight = attrs.get('weight_percentage')
        if section and weight is not None:
            current_sum = sum(
                a.weight_percentage 
                for a in Assessment.objects.filter(section=section)
                if self.instance is None or a.assessment_id != self.instance.assessment_id
            )
            if current_sum + Decimal(str(weight)) > Decimal('100.00'):
                raise serializers.ValidationError(
                    f"Total assessment weights would exceed 100% (current sum: {current_sum}%)."
                )
        return attrs


class GradeSerializer(serializers.ModelSerializer):
    assessment_name = serializers.ReadOnlyField(source='assessment.name')
    max_score = serializers.ReadOnlyField(source='assessment.max_score')
    student_number = serializers.ReadOnlyField(source='enrollment.student.student_number')
    student_name = serializers.ReadOnlyField(source='enrollment.student.full_name')

    class Meta:
        model = Grade
        fields = '__all__'

    def validate(self, attrs):
        assessment = attrs.get('assessment')
        score = attrs.get('score_obtained')
        if assessment and score is not None:
            if Decimal(str(score)) > Decimal(str(assessment.max_score)):
                raise serializers.ValidationError(
                    f"Score obtained ({score}) cannot exceed max score ({assessment.max_score})."
                )
        return attrs


class FinalGradeSerializer(serializers.ModelSerializer):
    student_number = serializers.ReadOnlyField(source='enrollment.student.student_number')
    student_name = serializers.ReadOnlyField(source='enrollment.student.full_name')
    course_code = serializers.ReadOnlyField(source='enrollment.section.course.course_code')
    course_title = serializers.ReadOnlyField(source='enrollment.section.course.title')

    class Meta:
        model = FinalGrade
        fields = '__all__'


class GradeBatchItemSerializer(serializers.Serializer):
    enrollment_id = serializers.UUIDField(required=True)
    assessment_id = serializers.UUIDField(required=True)
    score_obtained = serializers.DecimalField(max_digits=6, decimal_places=2, min_value=Decimal('0.00'))


class BatchGradesPayloadSerializer(serializers.Serializer):
    items = GradeBatchItemSerializer(many=True, required=True)
