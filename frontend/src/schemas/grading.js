import { z } from 'zod';

export const AssessmentSchema = z.object({
  name: z.string().min(1, 'Assessment name is required').max(100),
  type: z.enum(['assignment', 'quiz', 'midterm', 'final', 'project', 'participation']),
  weight_percentage: z.number().min(0.01, 'Weight must be positive').max(100.0, 'Weight cannot exceed 100%'),
  max_score: z.number().min(0.01, 'Max score must be greater than zero'),
  due_date: z.string().datetime().optional().nullable(),
  is_published: z.boolean().default(false),
});

export const GradeEntrySchema = z.object({
  enrollment_id: z.string().uuid('Invalid enrollment identifier'),
  assessment_id: z.string().uuid('Invalid assessment identifier'),
  score_obtained: z.number().min(0, 'Score cannot be negative'),
  max_score: z.number().min(0.01),
}).refine(data => data.score_obtained <= data.max_score, {
  message: 'Score obtained cannot exceed assessment max score',
  path: ['score_obtained'],
});

export const BatchGradesPayloadSchema = z.object({
  section_id: z.string().uuid(),
  items: z.array(
    z.object({
      enrollment_id: z.string().uuid(),
      assessment_id: z.string().uuid(),
      score_obtained: z.number().min(0),
    })
  ),
});

export const EnrollmentRequestSchema = z.object({
  section_id: z.string().uuid(),
  student_id: z.string().uuid(),
});
