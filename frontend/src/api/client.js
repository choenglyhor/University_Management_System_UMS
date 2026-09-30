/**
 * Unified API Client for University Portal (Pure JavaScript)
 * Handles requests to /api/v1/ with intelligent mock fallbacks
 */

const API_BASE = (import.meta && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '/api/v1';

export const apiClient = {
  // Fetch available course sections
  async getSections() {
    try {
      const res = await fetch(`${API_BASE}/sections/`);
      if (res.ok) {
        const data = await res.json();
        return data.results || data;
      }
    } catch {
      // Fallback mock
    }
    return [
      {
        section_id: 'sec-cs101-001',
        course_code: 'CS101',
        course_title: 'Introduction to Computer Science',
        section_number: '001',
        instructor_name: 'Dr. Alan Turing',
        schedule_slot: 'MWF 10:00-11:15',
        classroom: 'Turing Hall 101',
        capacity: 45,
        enrolled_count: 42,
        waitlist_count: 2,
      },
      {
        section_id: 'sec-cs201-001',
        course_code: 'CS201',
        course_title: 'Data Structures and Algorithms',
        section_number: '001',
        instructor_name: 'Dr. Ada Lovelace',
        schedule_slot: 'TR 13:30-15:00',
        classroom: 'Lovelace Center 204',
        capacity: 40,
        enrolled_count: 38,
        waitlist_count: 0,
      },
      {
        section_id: 'sec-se301-001',
        course_code: 'SE301',
        course_title: 'Database Management Systems',
        section_number: '001',
        instructor_name: 'Dr. Edgar Codd',
        schedule_slot: 'MWF 14:00-15:15',
        classroom: 'Turing Hall 305',
        capacity: 35,
        enrolled_count: 35,
        waitlist_count: 4,
      },
    ];
  },

  // Fetch Section Roster & Inline Grade Matrix
  async getSectionRoster(sectionId) {
    try {
      const res = await fetch(`${API_BASE}/grading/sections/${sectionId}/roster/`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback mock
    }
    return {
      section_id: sectionId,
      course_code: 'CS101',
      section_number: '001',
      assessments: [
        { id: 'asm-1', name: 'Assignment 1', weight_percentage: 15.0, max_score: 100.0, is_published: true },
        { id: 'asm-2', name: 'Midterm Exam', weight_percentage: 35.0, max_score: 100.0, is_published: true },
        { id: 'asm-3', name: 'Term Project', weight_percentage: 20.0, max_score: 50.0, is_published: false },
        { id: 'asm-4', name: 'Final Exam', weight_percentage: 30.0, max_score: 100.0, is_published: false },
      ],
      students: [
        {
          enrollment_id: 'enr-001',
          student_id: 'std-001',
          student_number: 'S2024001',
          full_name: 'Alice Smith',
          scores: { 'asm-1': 95.0, 'asm-2': 92.0, 'asm-3': 48.0, 'asm-4': 96.0 },
        },
        {
          enrollment_id: 'enr-002',
          student_id: 'std-002',
          student_number: 'S2024002',
          full_name: 'Bob Johnson',
          scores: { 'asm-1': 88.0, 'asm-2': 85.0, 'asm-3': 42.0, 'asm-4': null },
        },
        {
          enrollment_id: 'enr-003',
          student_id: 'std-003',
          student_number: 'S2024003',
          full_name: 'Charlie Brown',
          scores: { 'asm-1': 74.0, 'asm-2': 78.0, 'asm-3': null, 'asm-4': null },
        },
        {
          enrollment_id: 'enr-004',
          student_id: 'std-004',
          student_number: 'S2024004',
          full_name: 'Diana Prince',
          scores: { 'asm-1': 100.0, 'asm-2': 98.0, 'asm-3': 50.0, 'asm-4': 99.0 },
        },
      ],
    };
  },

  // Save batch grade entries
  async saveBatchGrades(sectionId, items) {
    const res = await fetch(`${API_BASE}/grading/sections/${sectionId}/grades/batch/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    });
    if (!res.ok) {
      throw new Error(`Failed to save grades (HTTP ${res.status})`);
    }
    return await res.json();
  },

  // Publish final section grades
  async publishFinalGrades(sectionId) {
    const res = await fetch(`${API_BASE}/grading/sections/${sectionId}/publish-final/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to publish grades' }));
      throw new Error(err.error || err.details || `Error ${res.status}`);
    }
    return await res.json();
  },

  // Fetch Student Transcript & CGPA
  async getStudentTranscript(studentId = 'std-001') {
    try {
      const res = await fetch(`${API_BASE}/grading/sections/student/transcript/?student_id=${studentId}`);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Fallback
    }
    return {
      student_id: studentId,
      student_number: 'S2024001',
      full_name: 'Alice Smith',
      cumulative_gpa: 3.92,
      total_credits_earned: 34.0,
      terms: [
        {
          semester_name: 'Fall 2025',
          term_gpa: 4.0,
          term_credits: 16.0,
          courses: [
            { course_code: 'CS101', title: 'Introduction to Computer Science', credits: 4.0, final_percentage: 96.8, letter_grade: 'A+', grade_points: 4.0 },
            { course_code: 'MATH101', title: 'Calculus I', credits: 4.0, final_percentage: 94.0, letter_grade: 'A', grade_points: 4.0 },
            { course_code: 'ENG101', title: 'Academic Writing & Research', credits: 4.0, final_percentage: 91.5, letter_grade: 'A-', grade_points: 3.7 },
            { course_code: 'PHYS101', title: 'Physics for Engineers', credits: 4.0, final_percentage: 95.0, letter_grade: 'A', grade_points: 4.0 },
          ],
        },
        {
          semester_name: 'Spring 2026',
          term_gpa: 3.85,
          term_credits: 18.0,
          courses: [
            { course_code: 'CS102', title: 'Object-Oriented Programming', credits: 4.0, final_percentage: 93.5, letter_grade: 'A', grade_points: 4.0 },
            { course_code: 'MATH102', title: 'Discrete Mathematics', credits: 4.0, final_percentage: 88.0, letter_grade: 'B+', grade_points: 3.3 },
            { course_code: 'SE201', title: 'Software Engineering Fundamentals', credits: 4.0, final_percentage: 95.2, letter_grade: 'A', grade_points: 4.0 },
          ],
        },
      ],
    };
  },

  // Fetch Course Catalog
  async getCourses() {
    try {
      const res = await fetch(`${API_BASE}/courses/`);
      if (res.ok) {
        const data = await res.json();
        return data.results || data;
      }
    } catch {
      // Fallback
    }
    return [
      {
        course_id: 'crs-1',
        course_code: 'CS101',
        title: 'Introduction to Computer Science',
        credits: 4.0,
        description: 'Foundations of computing, algorithmic thinking, and problem solving using Python.',
        department_code: 'CS',
        prerequisites: [],
      },
      {
        course_id: 'crs-2',
        course_code: 'CS201',
        title: 'Data Structures and Algorithms',
        credits: 4.0,
        description: 'Advanced data representation, trees, graphs, sorting, and algorithmic complexity.',
        department_code: 'CS',
        prerequisites: [{ prerequisite_course_code: 'CS101', prerequisite_course_title: 'Intro to CS', min_grade_points: 2.0 }],
      },
      {
        course_id: 'crs-3',
        course_code: 'SE301',
        title: 'Database Management Systems',
        credits: 3.0,
        description: 'Relational data modeling, SQL Server T-SQL, ACID transactions, indexing, and triggers.',
        department_code: 'SE',
        prerequisites: [{ prerequisite_course_code: 'CS201', prerequisite_course_title: 'Data Structures', min_grade_points: 2.0 }],
      },
      {
        course_id: 'crs-4',
        course_code: 'SE401',
        title: 'Distributed Systems & Cloud Computing',
        credits: 3.0,
        description: 'Microservices, consensus algorithms, high concurrency, and cloud architectures.',
        department_code: 'SE',
        prerequisites: [{ prerequisite_course_code: 'SE301', prerequisite_course_title: 'DBMS', min_grade_points: 2.5 }],
      },
    ];
  },

  // Validate student course prerequisites
  async checkPrerequisites(courseId, studentId) {
    const res = await fetch(`${API_BASE}/courses/${courseId}/check-prerequisites/?student_id=${studentId}`);
    return await res.json();
  },

  // Enroll in section
  async enroll(sectionId, studentId) {
    const res = await fetch(`${API_BASE}/enrollments/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_id: sectionId, student_id: studentId }),
    });
    return await res.json();
  },

  // Drop section
  async drop(sectionId, studentId) {
    const res = await fetch(`${API_BASE}/enrollments/drop/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ section_id: sectionId, student_id: studentId }),
    });
    return await res.json();
  },
};
