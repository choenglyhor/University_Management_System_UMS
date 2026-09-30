-- ============================================================================
-- UNIVERSITY STUDENT INFORMATION & GRADING PORTAL
-- Seed Data Script for Development, Testing & Verification
-- Target Engine: Microsoft SQL Server
-- ============================================================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET NOCOUNT ON;
GO

-- ----------------------------------------------------------------------------
-- 1. SEED DEPARTMENTS
-- ----------------------------------------------------------------------------
DECLARE @dept_cs UNIQUEIDENTIFIER = NEWID();
DECLARE @dept_se UNIQUEIDENTIFIER = NEWID();
DECLARE @dept_math UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.departments (department_id, dept_code, name, building, office_room)
VALUES 
    (@dept_cs, 'CS', 'Computer Science', 'Turing Hall', 'TH-401'),
    (@dept_se, 'SE', 'Software Engineering', 'Lovelace Center', 'LC-205'),
    (@dept_math, 'MATH', 'Mathematics & Statistics', 'Euler Building', 'EB-102');

-- ----------------------------------------------------------------------------
-- 2. SEED FACULTY
-- ----------------------------------------------------------------------------
DECLARE @fac_turing UNIQUEIDENTIFIER = NEWID();
DECLARE @fac_lovelace UNIQUEIDENTIFIER = NEWID();
DECLARE @fac_hopper UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.faculty (faculty_id, department_id, employee_number, first_name, last_name, email, title, hire_date)
VALUES 
    (@fac_turing, @dept_cs, 'FAC-1001', 'Alan', 'Turing', 'alan.turing@university.edu', 'Professor', '2015-08-15'),
    (@fac_lovelace, @dept_se, 'FAC-1002', 'Ada', 'Lovelace', 'ada.lovelace@university.edu', 'Department Chair', '2012-01-10'),
    (@fac_hopper, @dept_cs, 'FAC-1003', 'Grace', 'Hopper', 'grace.hopper@university.edu', 'Associate Professor', '2018-09-01');

-- ----------------------------------------------------------------------------
-- 3. SEED STUDENTS
-- ----------------------------------------------------------------------------
DECLARE @stud_alice UNIQUEIDENTIFIER = NEWID();
DECLARE @stud_bob UNIQUEIDENTIFIER = NEWID();
DECLARE @stud_charlie UNIQUEIDENTIFIER = NEWID();
DECLARE @stud_diana UNIQUEIDENTIFIER = NEWID();
DECLARE @stud_evan UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.students (student_id, department_id, student_number, first_name, last_name, email, enrollment_status, admission_date, cumulative_gpa)
VALUES 
    (@stud_alice, @dept_cs, 'S2024001', 'Alice', 'Smith', 'alice.smith@student.edu', 'active', '2024-09-01', 3.85),
    (@stud_bob, @dept_cs, 'S2024002', 'Bob', 'Jones', 'bob.jones@student.edu', 'active', '2024-09-01', 3.20),
    (@stud_charlie, @dept_se, 'S2024003', 'Charlie', 'Brown', 'charlie.brown@student.edu', 'active', '2024-09-01', 2.45),
    (@stud_diana, @dept_cs, 'S2025001', 'Diana', 'Prince', 'diana.prince@student.edu', 'active', '2025-09-01', 4.00),
    (@stud_evan, @dept_math, 'S2025002', 'Evan', 'Wright', 'evan.wright@student.edu', 'probation', '2025-09-01', 1.80);

-- ----------------------------------------------------------------------------
-- 4. SEED COURSES & PREREQUISITES
-- ----------------------------------------------------------------------------
DECLARE @course_cs101 UNIQUEIDENTIFIER = NEWID();
DECLARE @course_cs201 UNIQUEIDENTIFIER = NEWID();
DECLARE @course_cs301 UNIQUEIDENTIFIER = NEWID();
DECLARE @course_math101 UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.courses (course_id, department_id, course_code, title, description, credits, is_active)
VALUES 
    (@course_cs101, @dept_cs, 'CS101', 'Introduction to Computer Science', 'Foundations of imperative programming and algorithmic problem solving.', 3.0, 1),
    (@course_cs201, @dept_cs, 'CS201', 'Data Structures & Algorithms', 'Abstract data types, trees, graphs, sorting, searching, and complexity analysis.', 4.0, 1),
    (@course_cs301, @dept_cs, 'CS301', 'Database Management Systems', 'Relational data model, SQL, normalization, concurrency control, and indexing.', 4.0, 1),
    (@course_math101, @dept_math, 'MATH101', 'Discrete Mathematics', 'Logic, set theory, combinatorics, relations, graphs, and proof techniques.', 3.0, 1);

-- CS201 requires CS101 (min grade C / 2.00)
-- CS301 requires CS201 (min grade C / 2.00) and MATH101 (min grade C / 2.00)
INSERT INTO dbo.course_prerequisites (course_id, prerequisite_course_id, min_grade_points)
VALUES 
    (@course_cs201, @course_cs101, 2.00),
    (@course_cs301, @course_cs201, 2.00),
    (@course_cs301, @course_math101, 2.00);

-- ----------------------------------------------------------------------------
-- 5. SEED SEMESTERS
-- ----------------------------------------------------------------------------
DECLARE @sem_fall2025 UNIQUEIDENTIFIER = NEWID();
DECLARE @sem_spring2026 UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.semesters (semester_id, term, year, start_date, end_date, is_active, enrollment_open)
VALUES 
    (@sem_fall2025, 'fall', 2025, '2025-09-01', '2025-12-20', 0, 0),
    (@sem_spring2026, 'spring', 2026, '2026-01-15', '2026-05-15', 1, 1);

-- ----------------------------------------------------------------------------
-- 6. SEED COURSE SECTIONS
-- ----------------------------------------------------------------------------
-- Fall 2025 Sections (Past Term)
DECLARE @sec_cs101_fall UNIQUEIDENTIFIER = NEWID();
DECLARE @sec_math101_fall UNIQUEIDENTIFIER = NEWID();

-- Spring 2026 Sections (Active Term)
DECLARE @sec_cs201_spring UNIQUEIDENTIFIER = NEWID();
DECLARE @sec_cs301_spring UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.course_sections (section_id, course_id, semester_id, faculty_id, section_number, capacity, waitlist_capacity, classroom, schedule_slot, assessments_locked)
VALUES 
    (@sec_cs101_fall, @course_cs101, @sem_fall2025, @fac_turing, '01', 30, 10, 'TH-101', 'MWF 09:00-10:00', 1),
    (@sec_math101_fall, @course_math101, @sem_fall2025, @fac_hopper, '01', 35, 10, 'EB-204', 'TTh 10:30-12:00', 1),
    (@sec_cs201_spring, @course_cs201, @sem_spring2026, @fac_lovelace, '01', 2, 5, 'LC-301', 'MWF 11:00-12:15', 0), -- Low capacity to test waitlist
    (@sec_cs301_spring, @course_cs301, @sem_spring2026, @fac_turing, '01', 25, 10, 'TH-205', 'TTh 13:00-14:30', 0);

-- ----------------------------------------------------------------------------
-- 7. SEED ENROLLMENTS (PAST & ACTIVE)
-- ----------------------------------------------------------------------------
-- Fall 2025 completed enrollments
DECLARE @enr_alice_cs101 UNIQUEIDENTIFIER = NEWID();
DECLARE @enr_bob_cs101 UNIQUEIDENTIFIER = NEWID();
DECLARE @enr_charlie_cs101 UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.enrollments (enrollment_id, section_id, student_id, status, enrolled_at)
VALUES 
    (@enr_alice_cs101, @sec_cs101_fall, @stud_alice, 'completed', '2025-08-20T09:00:00Z'),
    (@enr_bob_cs101, @sec_cs101_fall, @stud_bob, 'completed', '2025-08-20T09:05:00Z'),
    (@enr_charlie_cs101, @sec_cs101_fall, @stud_charlie, 'completed', '2025-08-21T14:30:00Z');

-- Spring 2026 active & waitlisted enrollments (Capacity = 2)
DECLARE @enr_alice_cs201 UNIQUEIDENTIFIER = NEWID();
DECLARE @enr_bob_cs201 UNIQUEIDENTIFIER = NEWID();
DECLARE @enr_charlie_cs201 UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.enrollments (enrollment_id, section_id, student_id, status, waitlist_position, enrolled_at)
VALUES 
    (@enr_alice_cs201, @sec_cs201_spring, @stud_alice, 'enrolled', NULL, '2026-01-10T08:00:00Z'),
    (@enr_bob_cs201, @sec_cs201_spring, @stud_bob, 'enrolled', NULL, '2026-01-10T08:01:00Z'),
    (@enr_charlie_cs201, @sec_cs201_spring, @stud_charlie, 'waitlisted', 1, '2026-01-10T08:05:00Z');

-- ----------------------------------------------------------------------------
-- 8. SEED ASSESSMENTS (Weights sum strictly to 100.00%)
-- ----------------------------------------------------------------------------
-- CS101 (Completed)
DECLARE @asm_cs101_midterm UNIQUEIDENTIFIER = NEWID();
DECLARE @asm_cs101_final UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.assessments (assessment_id, section_id, name, type, weight_percentage, max_score, due_date, is_published)
VALUES 
    (@asm_cs101_midterm, @sec_cs101_fall, 'Midterm Examination', 'midterm', 40.00, 100.00, '2025-10-15T10:00:00Z', 1),
    (@asm_cs101_final, @sec_cs101_fall, 'Final Examination', 'final', 60.00, 100.00, '2025-12-18T10:00:00Z', 1);

-- CS201 (Active Term: Assignment 1 (20%), Midterm (30%), Final Project (50%) = 100%)
DECLARE @asm_cs201_a1 UNIQUEIDENTIFIER = NEWID();
DECLARE @asm_cs201_midterm UNIQUEIDENTIFIER = NEWID();
DECLARE @asm_cs201_project UNIQUEIDENTIFIER = NEWID();

INSERT INTO dbo.assessments (assessment_id, section_id, name, type, weight_percentage, max_score, due_date, is_published)
VALUES 
    (@asm_cs201_a1, @sec_cs201_spring, 'Assignment 1: Linked Lists & Trees', 'assignment', 20.00, 50.00, '2026-02-15T23:59:00Z', 1),
    (@asm_cs201_midterm, @sec_cs201_spring, 'Midterm Exam', 'midterm', 30.00, 100.00, '2026-03-20T11:00:00Z', 1),
    (@asm_cs201_project, @sec_cs201_spring, 'Term Project: Graph Search', 'project', 50.00, 100.00, '2026-05-01T23:59:00Z', 0); -- Still draft/unpublished

-- ----------------------------------------------------------------------------
-- 9. SEED CONTINUOUS GRADES
-- ----------------------------------------------------------------------------
INSERT INTO dbo.grades (enrollment_id, assessment_id, score_obtained, feedback, graded_by)
VALUES 
    -- Fall 2025 CS101 Grades
    (@enr_alice_cs101, @asm_cs101_midterm, 95.00, 'Excellent algorithmic clarity.', @fac_turing),
    (@enr_alice_cs101, @asm_cs101_final, 98.00, 'Top score in the class.', @fac_turing),
    (@enr_bob_cs101, @asm_cs101_midterm, 82.00, 'Good job; check boundary conditions.', @fac_turing),
    (@enr_bob_cs101, @asm_cs101_final, 84.00, 'Solid understanding.', @fac_turing),
    (@enr_charlie_cs101, @asm_cs101_midterm, 71.00, 'Review loop invariants.', @fac_turing),
    (@enr_charlie_cs101, @asm_cs101_final, 73.00, 'Met minimum requirements.', @fac_turing),

    -- Spring 2026 CS201 Grades (Continuous)
    (@enr_alice_cs201, @asm_cs201_a1, 49.00, 'Flawless pointer arithmetic.', @fac_lovelace),
    (@enr_alice_cs201, @asm_cs201_midterm, 94.00, 'Great analysis of AVL balance factors.', @fac_lovelace),
    (@enr_bob_cs201, @asm_cs201_a1, 42.00, 'Minor memory leak in destructor.', @fac_lovelace),
    (@enr_bob_cs201, @asm_cs201_midterm, 85.00, 'Well reasoned.', @fac_lovelace);

-- ----------------------------------------------------------------------------
-- 10. SEED FINAL GRADES (COMPLETED COURSES WITH 4.0 SCALE TRANSLATION)
-- ----------------------------------------------------------------------------
-- Alice CS101: 95 * 0.40 + 98 * 0.60 = 38.0 + 58.8 = 96.80% -> A+ (4.00)
-- Bob CS101:   82 * 0.40 + 84 * 0.60 = 32.8 + 50.4 = 83.20% -> B (3.00)
-- Charlie CS101: 71 * 0.40 + 73 * 0.60 = 28.4 + 43.8 = 72.20% -> C- (1.70)
INSERT INTO dbo.final_grades (enrollment_id, calculated_percentage, letter_grade, grade_points, is_published, published_by, published_at)
VALUES 
    (@enr_alice_cs101, 96.80, 'A+', 4.00, 1, @fac_turing, '2025-12-22T12:00:00Z'),
    (@enr_bob_cs101, 83.20, 'B', 3.00, 1, @fac_turing, '2025-12-22T12:00:00Z'),
    (@enr_charlie_cs101, 72.20, 'C-', 1.70, 1, @fac_turing, '2025-12-22T12:00:00Z');
GO

PRINT 'Seed data successfully loaded with strict relational and domain constraints!';
GO
