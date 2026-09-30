-- ============================================================================
-- UNIVERSITY STUDENT INFORMATION & GRADING PORTAL
-- Target Engine: Microsoft SQL Server (2019 / 2022)
-- Relational Schema DDL with Strict Constraints, Triggers & Indexing Strategy
-- ============================================================================

-- Switch to database (uncomment if running in dedicated database)
-- USE UniversityPortalDB;
-- GO

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- ============================================================================
-- 0. CLEANUP (FOR RE-RUNNABILITY IN DEVELOPMENT)
-- ============================================================================
IF OBJECT_ID('dbo.trg_Assessments_ValidateTotalWeight', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_Assessments_ValidateTotalWeight;
IF OBJECT_ID('dbo.trg_Grades_ValidateScore', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_Grades_ValidateScore;
IF OBJECT_ID('dbo.trg_Enrollments_AutoPromoteWaitlist', 'TR') IS NOT NULL DROP TRIGGER dbo.trg_Enrollments_AutoPromoteWaitlist;
IF OBJECT_ID('dbo.sp_ValidateSectionAssessmentWeights', 'P') IS NOT NULL DROP PROCEDURE dbo.sp_ValidateSectionAssessmentWeights;
IF OBJECT_ID('dbo.final_grades', 'U') IS NOT NULL DROP TABLE dbo.final_grades;
IF OBJECT_ID('dbo.grades', 'U') IS NOT NULL DROP TABLE dbo.grades;
IF OBJECT_ID('dbo.assessments', 'U') IS NOT NULL DROP TABLE dbo.assessments;
IF OBJECT_ID('dbo.enrollments', 'U') IS NOT NULL DROP TABLE dbo.enrollments;
IF OBJECT_ID('dbo.course_sections', 'U') IS NOT NULL DROP TABLE dbo.course_sections;
IF OBJECT_ID('dbo.semesters', 'U') IS NOT NULL DROP TABLE dbo.semesters;
IF OBJECT_ID('dbo.course_prerequisites', 'U') IS NOT NULL DROP TABLE dbo.course_prerequisites;
IF OBJECT_ID('dbo.courses', 'U') IS NOT NULL DROP TABLE dbo.courses;
IF OBJECT_ID('dbo.students', 'U') IS NOT NULL DROP TABLE dbo.students;
IF OBJECT_ID('dbo.faculty', 'U') IS NOT NULL DROP TABLE dbo.faculty;
IF OBJECT_ID('dbo.departments', 'U') IS NOT NULL DROP TABLE dbo.departments;
GO

-- ============================================================================
-- 1. CORE TABLES DDL
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1.1 DEPARTMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.departments (
    department_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_departments_id DEFAULT NEWSEQUENTIALID(),
    dept_code NVARCHAR(10) NOT NULL,
    name NVARCHAR(100) NOT NULL,
    building NVARCHAR(50) NULL,
    office_room NVARCHAR(20) NULL,
    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_departments_created DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_departments_updated DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT PK_departments PRIMARY KEY CLUSTERED (department_id),
    CONSTRAINT UQ_departments_dept_code UNIQUE (dept_code),
    CONSTRAINT UQ_departments_name UNIQUE (name)
);
GO

-- ----------------------------------------------------------------------------
-- 1.2 FACULTY
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.faculty (
    faculty_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_faculty_id DEFAULT NEWSEQUENTIALID(),
    department_id UNIQUEIDENTIFIER NOT NULL,
    employee_number NVARCHAR(20) NOT NULL,
    first_name NVARCHAR(50) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    email NVARCHAR(120) NOT NULL,
    title NVARCHAR(30) NOT NULL CONSTRAINT DF_faculty_title DEFAULT 'Assistant Professor',
    is_active BIT NOT NULL CONSTRAINT DF_faculty_is_active DEFAULT 1,
    hire_date DATE NOT NULL,
    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_faculty_created DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_faculty_updated DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT PK_faculty PRIMARY KEY CLUSTERED (faculty_id),
    CONSTRAINT UQ_faculty_employee_number UNIQUE (employee_number),
    CONSTRAINT UQ_faculty_email UNIQUE (email),
    CONSTRAINT FK_faculty_departments FOREIGN KEY (department_id) 
        REFERENCES dbo.departments (department_id) ON DELETE NO ACTION,
    CONSTRAINT CK_faculty_title CHECK (title IN (
        'Instructor', 'Lecturer', 'Assistant Professor', 
        'Associate Professor', 'Professor', 'Department Chair', 'Dean'
    ))
);
GO

-- ----------------------------------------------------------------------------
-- 1.3 STUDENTS
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.students (
    student_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_students_id DEFAULT NEWSEQUENTIALID(),
    department_id UNIQUEIDENTIFIER NOT NULL,
    student_number NVARCHAR(20) NOT NULL,
    first_name NVARCHAR(50) NOT NULL,
    last_name NVARCHAR(50) NOT NULL,
    email NVARCHAR(120) NOT NULL,
    enrollment_status NVARCHAR(20) NOT NULL CONSTRAINT DF_students_status DEFAULT 'active',
    admission_date DATE NOT NULL,
    cumulative_gpa DECIMAL(3,2) NOT NULL CONSTRAINT DF_students_cgpa DEFAULT 0.00,
    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_students_created DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_students_updated DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT PK_students PRIMARY KEY CLUSTERED (student_id),
    CONSTRAINT UQ_students_student_number UNIQUE (student_number),
    CONSTRAINT UQ_students_email UNIQUE (email),
    CONSTRAINT FK_students_departments FOREIGN KEY (department_id) 
        REFERENCES dbo.departments (department_id) ON DELETE NO ACTION,
    CONSTRAINT CK_students_enrollment_status CHECK (enrollment_status IN (
        'active', 'probation', 'graduated', 'suspended', 'withdrawn'
    )),
    CONSTRAINT CK_students_cgpa CHECK (cumulative_gpa >= 0.00 AND cumulative_gpa <= 4.00)
);
GO

-- ----------------------------------------------------------------------------
-- 1.4 COURSES
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.courses (
    course_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_courses_id DEFAULT NEWSEQUENTIALID(),
    department_id UNIQUEIDENTIFIER NOT NULL,
    course_code NVARCHAR(20) NOT NULL,
    title NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX) NULL,
    credits DECIMAL(3,1) NOT NULL CONSTRAINT DF_courses_credits DEFAULT 3.0,
    is_active BIT NOT NULL CONSTRAINT DF_courses_is_active DEFAULT 1,
    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_courses_created DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_courses_updated DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT PK_courses PRIMARY KEY CLUSTERED (course_id),
    CONSTRAINT UQ_courses_course_code UNIQUE (course_code),
    CONSTRAINT FK_courses_departments FOREIGN KEY (department_id) 
        REFERENCES dbo.departments (department_id) ON DELETE NO ACTION,
    CONSTRAINT CK_courses_credits CHECK (credits > 0.0 AND credits <= 12.0)
);
GO

-- ----------------------------------------------------------------------------
-- 1.5 COURSE PREREQUISITES
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.course_prerequisites (
    id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_course_prerequisites_id DEFAULT NEWID(),
    course_id UNIQUEIDENTIFIER NOT NULL,
    prerequisite_course_id UNIQUEIDENTIFIER NOT NULL,
    min_grade_points DECIMAL(3,2) NOT NULL CONSTRAINT DF_prereq_min_grade DEFAULT 2.00, -- 'C' = 2.00
    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_prereq_created DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT PK_course_prerequisites PRIMARY KEY CLUSTERED (course_id, prerequisite_course_id),
    CONSTRAINT FK_prereq_target_course FOREIGN KEY (course_id) 
        REFERENCES dbo.courses (course_id) ON DELETE CASCADE,
    CONSTRAINT FK_prereq_required_course FOREIGN KEY (prerequisite_course_id) 
        REFERENCES dbo.courses (course_id) ON DELETE NO ACTION,
    CONSTRAINT CK_prereq_no_self_reference CHECK (course_id <> prerequisite_course_id),
    CONSTRAINT CK_prereq_min_grade CHECK (min_grade_points >= 0.00 AND min_grade_points <= 4.00)
);
GO

-- ----------------------------------------------------------------------------
-- 1.6 SEMESTERS
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.semesters (
    semester_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_semesters_id DEFAULT NEWSEQUENTIALID(),
    term NVARCHAR(10) NOT NULL,
    year INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BIT NOT NULL CONSTRAINT DF_semesters_is_active DEFAULT 0,
    enrollment_open BIT NOT NULL CONSTRAINT DF_semesters_enrollment DEFAULT 0,
    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_semesters_created DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT PK_semesters PRIMARY KEY CLUSTERED (semester_id),
    CONSTRAINT UQ_semesters_term_year UNIQUE (term, year),
    CONSTRAINT CK_semesters_term CHECK (term IN ('fall', 'spring', 'summer', 'winter')),
    CONSTRAINT CK_semesters_year CHECK (year >= 2000 AND year <= 2100),
    CONSTRAINT CK_semesters_dates CHECK (end_date > start_date)
);
GO

-- ----------------------------------------------------------------------------
-- 1.7 COURSE SECTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.course_sections (
    section_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_sections_id DEFAULT NEWSEQUENTIALID(),
    course_id UNIQUEIDENTIFIER NOT NULL,
    semester_id UNIQUEIDENTIFIER NOT NULL,
    faculty_id UNIQUEIDENTIFIER NULL,
    section_number NVARCHAR(10) NOT NULL,
    capacity INT NOT NULL,
    waitlist_capacity INT NOT NULL CONSTRAINT DF_sections_waitlist_cap DEFAULT 10,
    classroom NVARCHAR(50) NULL,
    schedule_slot NVARCHAR(100) NULL, -- e.g. 'MWF 10:00-11:15'
    assessments_locked BIT NOT NULL CONSTRAINT DF_sections_assessments_locked DEFAULT 0,
    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_sections_created DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_sections_updated DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT PK_course_sections PRIMARY KEY CLUSTERED (section_id),
    CONSTRAINT UQ_sections_course_sem_num UNIQUE (course_id, semester_id, section_number),
    CONSTRAINT FK_sections_courses FOREIGN KEY (course_id) 
        REFERENCES dbo.courses (course_id) ON DELETE NO ACTION,
    CONSTRAINT FK_sections_semesters FOREIGN KEY (semester_id) 
        REFERENCES dbo.semesters (semester_id) ON DELETE NO ACTION,
    CONSTRAINT FK_sections_faculty FOREIGN KEY (faculty_id) 
        REFERENCES dbo.faculty (faculty_id) ON DELETE SET NULL,
    CONSTRAINT CK_sections_capacity CHECK (capacity > 0),
    CONSTRAINT CK_sections_waitlist_capacity CHECK (waitlist_capacity >= 0)
);
GO

-- ----------------------------------------------------------------------------
-- 1.8 ENROLLMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.enrollments (
    enrollment_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_enrollments_id DEFAULT NEWSEQUENTIALID(),
    section_id UNIQUEIDENTIFIER NOT NULL,
    student_id UNIQUEIDENTIFIER NOT NULL,
    status NVARCHAR(20) NOT NULL CONSTRAINT DF_enrollments_status DEFAULT 'enrolled',
    waitlist_position INT NULL,
    enrolled_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_enrollments_created DEFAULT SYSDATETIMEOFFSET(),
    dropped_at DATETIMEOFFSET NULL,

    CONSTRAINT PK_enrollments PRIMARY KEY CLUSTERED (enrollment_id),
    CONSTRAINT UQ_enrollments_section_student UNIQUE (section_id, student_id),
    CONSTRAINT FK_enrollments_sections FOREIGN KEY (section_id) 
        REFERENCES dbo.course_sections (section_id) ON DELETE NO ACTION,
    CONSTRAINT FK_enrollments_students FOREIGN KEY (student_id) 
        REFERENCES dbo.students (student_id) ON DELETE NO ACTION,
    CONSTRAINT CK_enrollments_status CHECK (status IN ('enrolled', 'waitlisted', 'dropped', 'completed')),
    CONSTRAINT CK_enrollments_waitlist_pos CHECK (
        (status = 'waitlisted' AND waitlist_position IS NOT NULL AND waitlist_position > 0) OR
        (status <> 'waitlisted' AND waitlist_position IS NULL)
    )
);
GO

-- ----------------------------------------------------------------------------
-- 1.9 ASSESSMENTS
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.assessments (
    assessment_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_assessments_id DEFAULT NEWSEQUENTIALID(),
    section_id UNIQUEIDENTIFIER NOT NULL,
    name NVARCHAR(100) NOT NULL,
    type NVARCHAR(20) NOT NULL,
    weight_percentage DECIMAL(5,2) NOT NULL,
    max_score DECIMAL(6,2) NOT NULL,
    due_date DATETIMEOFFSET NULL,
    is_published BIT NOT NULL CONSTRAINT DF_assessments_is_published DEFAULT 0,
    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_assessments_created DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_assessments_updated DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT PK_assessments PRIMARY KEY CLUSTERED (assessment_id),
    CONSTRAINT UQ_assessments_section_name UNIQUE (section_id, name),
    CONSTRAINT FK_assessments_sections FOREIGN KEY (section_id) 
        REFERENCES dbo.course_sections (section_id) ON DELETE CASCADE,
    CONSTRAINT CK_assessments_type CHECK (type IN (
        'assignment', 'quiz', 'midterm', 'final', 'project', 'participation'
    )),
    CONSTRAINT CK_assessments_weight CHECK (weight_percentage > 0.00 AND weight_percentage <= 100.00),
    CONSTRAINT CK_assessments_max_score CHECK (max_score > 0.00)
);
GO

-- ----------------------------------------------------------------------------
-- 1.10 GRADES (CONTINUOUS MARKS)
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.grades (
    grade_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_grades_id DEFAULT NEWSEQUENTIALID(),
    enrollment_id UNIQUEIDENTIFIER NOT NULL,
    assessment_id UNIQUEIDENTIFIER NOT NULL,
    score_obtained DECIMAL(6,2) NOT NULL,
    feedback NVARCHAR(MAX) NULL,
    graded_by UNIQUEIDENTIFIER NULL,
    graded_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_grades_graded_at DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_grades_updated DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT PK_grades PRIMARY KEY CLUSTERED (grade_id),
    CONSTRAINT UQ_grades_enrollment_assessment UNIQUE (enrollment_id, assessment_id),
    CONSTRAINT FK_grades_enrollments FOREIGN KEY (enrollment_id) 
        REFERENCES dbo.enrollments (enrollment_id) ON DELETE CASCADE,
    CONSTRAINT FK_grades_assessments FOREIGN KEY (assessment_id) 
        REFERENCES dbo.assessments (assessment_id) ON DELETE NO ACTION,
    CONSTRAINT FK_grades_faculty FOREIGN KEY (graded_by) 
        REFERENCES dbo.faculty (faculty_id) ON DELETE SET NULL,
    CONSTRAINT CK_grades_score_positive CHECK (score_obtained >= 0.00)
);
GO

-- ----------------------------------------------------------------------------
-- 1.11 FINAL GRADES (PUBLISHED TRANSCRIPT RECORD)
-- ----------------------------------------------------------------------------
CREATE TABLE dbo.final_grades (
    final_grade_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_final_grades_id DEFAULT NEWSEQUENTIALID(),
    enrollment_id UNIQUEIDENTIFIER NOT NULL,
    calculated_percentage DECIMAL(5,2) NOT NULL,
    letter_grade NVARCHAR(3) NOT NULL,
    grade_points DECIMAL(3,2) NOT NULL,
    is_published BIT NOT NULL CONSTRAINT DF_final_grades_is_published DEFAULT 0,
    published_by UNIQUEIDENTIFIER NULL,
    published_at DATETIMEOFFSET NULL,
    created_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_final_grades_created DEFAULT SYSDATETIMEOFFSET(),
    updated_at DATETIMEOFFSET NOT NULL CONSTRAINT DF_final_grades_updated DEFAULT SYSDATETIMEOFFSET(),

    CONSTRAINT PK_final_grades PRIMARY KEY CLUSTERED (final_grade_id),
    CONSTRAINT UQ_final_grades_enrollment UNIQUE (enrollment_id), -- Strict 1-to-1 with enrollment
    CONSTRAINT FK_final_grades_enrollments FOREIGN KEY (enrollment_id) 
        REFERENCES dbo.enrollments (enrollment_id) ON DELETE CASCADE,
    CONSTRAINT FK_final_grades_faculty FOREIGN KEY (published_by) 
        REFERENCES dbo.faculty (faculty_id) ON DELETE NO ACTION,
    CONSTRAINT CK_final_grades_percentage CHECK (calculated_percentage >= 0.00 AND calculated_percentage <= 100.00),
    CONSTRAINT CK_final_grades_points CHECK (grade_points >= 0.00 AND grade_points <= 4.00),
    CONSTRAINT CK_final_grades_letter CHECK (letter_grade IN (
        'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'
    ))
);
GO

-- ============================================================================
-- 2. BUSINESS INTEGRITY TRIGGERS & FUNCTIONS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1 TRIGGER: ENFORCE GRADE SCORE <= ASSESSMENT MAX SCORE
-- In T-SQL, cross-table checks are reliably enforced using an AFTER TRIGGER.
-- ----------------------------------------------------------------------------
CREATE TRIGGER dbo.trg_Grades_ValidateScore
ON dbo.grades
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1 
        FROM inserted i
        INNER JOIN dbo.assessments a ON i.assessment_id = a.assessment_id
        WHERE i.score_obtained > a.max_score
    )
    BEGIN
        RAISERROR (
            'Data Integrity Violation: score_obtained exceeds the assessment max_score.',
            16, 1
        );
        ROLLBACK TRANSACTION;
        RETURN;
    END;
END;
GO

-- ----------------------------------------------------------------------------
-- 2.2 TRIGGER: ENFORCE SECTION ASSESSMENT WEIGHTS CEILING & FINALIZATION
-- Enforces that the sum of weights for a section cannot exceed 100.00%.
-- Also prevents altering assessments once section is marked assessments_locked = 1.
-- ----------------------------------------------------------------------------
CREATE TRIGGER dbo.trg_Assessments_ValidateTotalWeight
ON dbo.assessments
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Collect affected section IDs from inserted and deleted
    DECLARE @AffectedSections TABLE (section_id UNIQUEIDENTIFIER PRIMARY KEY);
    INSERT INTO @AffectedSections (section_id)
    SELECT section_id FROM inserted
    UNION
    SELECT section_id FROM deleted;

    -- Check if any section exceeds 100.00%
    IF EXISTS (
        SELECT a.section_id, SUM(a.weight_percentage) AS total_weight
        FROM dbo.assessments a
        INNER JOIN @AffectedSections sec ON a.section_id = sec.section_id
        GROUP BY a.section_id
        HAVING SUM(a.weight_percentage) > 100.00
    )
    BEGIN
        RAISERROR (
            'Data Integrity Violation: Total assessment weights for a section cannot exceed 100.00%%.',
            16, 1
        );
        ROLLBACK TRANSACTION;
        RETURN;
    END;
END;
GO

-- ----------------------------------------------------------------------------
-- 2.3 STORED PROCEDURE: VALIDATE SECTION WEIGHTS EXACT 100% BEFORE PUBLISHING
-- Ensures all weights add up to exactly 100.00% before grades can be finalized.
-- ----------------------------------------------------------------------------
CREATE PROCEDURE dbo.sp_ValidateSectionAssessmentWeights
    @section_id UNIQUEIDENTIFIER,
    @is_valid BIT OUTPUT,
    @total_weight DECIMAL(5,2) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    SELECT @total_weight = ISNULL(SUM(weight_percentage), 0.00)
    FROM dbo.assessments
    WHERE section_id = @section_id;

    IF @total_weight = 100.00
    BEGIN
        SET @is_valid = 1;
    END
    ELSE
    BEGIN
        SET @is_valid = 0;
    END;
END;
GO

-- ----------------------------------------------------------------------------
-- 2.4 TRIGGER: AUTO-WAITLIST CONCURRENCY / TRANSITION ON DROP
-- When an enrolled student drops, automatically promote waitlist #1 to enrolled.
-- ----------------------------------------------------------------------------
CREATE TRIGGER dbo.trg_Enrollments_AutoPromoteWaitlist
ON dbo.enrollments
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Trigger only when an 'enrolled' student transitions to 'dropped'
    IF NOT (UPDATE(status)) RETURN;

    DECLARE @DroppedSections TABLE (section_id UNIQUEIDENTIFIER);
    INSERT INTO @DroppedSections
    SELECT DISTINCT i.section_id
    FROM inserted i
    INNER JOIN deleted d ON i.enrollment_id = d.enrollment_id
    WHERE d.status = 'enrolled' AND i.status = 'dropped';

    IF NOT EXISTS (SELECT 1 FROM @DroppedSections) RETURN;

    DECLARE @sec_id UNIQUEIDENTIFIER;
    DECLARE sec_cursor CURSOR LOCAL FAST_FORWARD FOR 
        SELECT section_id FROM @DroppedSections;

    OPEN sec_cursor;
    FETCH NEXT FROM sec_cursor INTO @sec_id;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Find student at waitlist position 1
        DECLARE @candidate_id UNIQUEIDENTIFIER;
        SELECT TOP 1 @candidate_id = enrollment_id
        FROM dbo.enrollments
        WHERE section_id = @sec_id AND status = 'waitlisted'
        ORDER BY waitlist_position ASC;

        IF @candidate_id IS NOT NULL
        BEGIN
            -- Promote candidate to enrolled
            UPDATE dbo.enrollments
            SET status = 'enrolled',
                waitlist_position = NULL
            WHERE enrollment_id = @candidate_id;

            -- Re-index remaining waitlisted students
            ;WITH RankedWaitlist AS (
                SELECT enrollment_id, ROW_NUMBER() OVER (ORDER BY waitlist_position ASC) AS new_pos
                FROM dbo.enrollments
                WHERE section_id = @sec_id AND status = 'waitlisted'
            )
            UPDATE e
            SET e.waitlist_position = r.new_pos
            FROM dbo.enrollments e
            INNER JOIN RankedWaitlist r ON e.enrollment_id = r.enrollment_id;
        END;

        FETCH NEXT FROM sec_cursor INTO @sec_id;
    END;

    CLOSE sec_cursor;
    DEALLOCATE sec_cursor;
END;
GO

-- ============================================================================
-- 3. ENTERPRISE INDEXING STRATEGY
-- ============================================================================

-- Fast lookup of courses by department
CREATE NONCLUSTERED INDEX IX_courses_department_id 
ON dbo.courses (department_id) 
INCLUDE (course_code, title, credits);

-- Fast lookup of course sections for active semesters
CREATE NONCLUSTERED INDEX IX_course_sections_semester_course 
ON dbo.course_sections (semester_id, course_id) 
INCLUDE (faculty_id, section_number, capacity);

-- Filtered Index: Fast access to active semesters
CREATE NONCLUSTERED INDEX IX_semesters_active 
ON dbo.semesters (is_active) 
WHERE is_active = 1;

-- Fast student transcript queries (student_id -> enrollment -> final grade)
CREATE NONCLUSTERED INDEX IX_enrollments_student_status 
ON dbo.enrollments (student_id, status) 
INCLUDE (section_id, enrolled_at);

-- Fast section roster retrieval
CREATE NONCLUSTERED INDEX IX_enrollments_section_status 
ON dbo.enrollments (section_id, status) 
INCLUDE (student_id, waitlist_position);

-- Fast gradebook score matrix lookups (covering assessment and score)
CREATE NONCLUSTERED INDEX IX_grades_assessment_enrollment 
ON dbo.grades (assessment_id, enrollment_id) 
INCLUDE (score_obtained, graded_at);

-- Fast lookup for published final grades (transcript generation)
CREATE NONCLUSTERED INDEX IX_final_grades_published 
ON dbo.final_grades (enrollment_id, is_published) 
INCLUDE (calculated_percentage, letter_grade, grade_points);

-- Prerequisite verification lookup
CREATE NONCLUSTERED INDEX IX_prereq_course 
ON dbo.course_prerequisites (course_id) 
INCLUDE (prerequisite_course_id, min_grade_points);
GO
