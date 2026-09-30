import uuid
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from apps.core.permissions import UserRole

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email address is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', UserRole.ADMIN)
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = None
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=UserRole.CHOICES, default=UserRole.STUDENT)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    class Meta:
        db_table = 'portal_users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'

    @property
    def faculty_profile(self):
        try:
            from apps.academic.models import Faculty
            return Faculty.objects.filter(email=self.email).first()
        except Exception:
            return None

    @property
    def faculty_profile_rel(self):
        return self.faculty_profile

    @property
    def student_profile(self):
        try:
            from apps.academic.models import Student
            return Student.objects.filter(email=self.email).first()
        except Exception:
            return None

    @property
    def student_profile_rel(self):
        return self.student_profile

    def __str__(self):
        return f"{self.email} ({self.role})"
