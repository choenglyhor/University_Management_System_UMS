from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from apps.core.serializers import CustomTokenObtainPairSerializer, UserSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        data = serializer.data
        data['faculty_profile'] = None
        data['student_profile'] = None

        f = getattr(request.user, 'faculty_profile_rel', None)
        if f:
            data['faculty_profile'] = {
                'faculty_id': str(f.faculty_id),
                'department_id': str(f.department_id),
                'employee_number': f.employee_number,
                'title': f.title,
            }

        s = getattr(request.user, 'student_profile_rel', None)
        if s:
            data['student_profile'] = {
                'student_id': str(s.student_id),
                'department_id': str(s.department_id),
                'student_number': s.student_number,
                'cumulative_gpa': float(s.cumulative_gpa),
            }

        return Response(data, status=status.HTTP_200_OK)
