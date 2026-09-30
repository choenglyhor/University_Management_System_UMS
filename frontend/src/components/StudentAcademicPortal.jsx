import React, { useState } from 'react';

export const StudentAcademicPortal = ({
  studentName = 'Student',
  studentNumber = 'S0000000',
  cgpa = 0.0,
  totalCreditsEarned = 0,
  activeCourses = [],
  transcriptTerms = [],
  prerequisiteTree = [],
}) => {
  const [activeTab, setActiveTab] = useState('current');

  return (
    <div className="max-w-6xl mx-auto space-y-8 text-slate-100 p-6">
      {/* Top Academic Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider font-semibold text-sky-400">Student Portal</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">{studentName}</h1>
          <p className="text-sm font-mono text-slate-400 mt-0.5">ID: {studentNumber} • Department of Computer Science</p>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-center px-4 py-2 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">Cumulative GPA</span>
            <div className="text-3xl font-extrabold text-emerald-400 font-mono mt-0.5">
              {Number(cgpa).toFixed(2)}
            </div>
          </div>
          <div className="text-center px-4 py-2 bg-slate-950/60 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-semibold">Credits Earned</span>
            <div className="text-3xl font-extrabold text-sky-400 font-mono mt-0.5">
              {totalCreditsEarned}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 space-x-8 text-sm font-medium">
        <button
          onClick={() => setActiveTab('current')}
          className={`pb-3 transition-colors ${
            activeTab === 'current'
              ? 'border-b-2 border-sky-400 text-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Active Enrolled Courses ({activeCourses.length})
        </button>
        <button
          onClick={() => setActiveTab('transcript')}
          className={`pb-3 transition-colors ${
            activeTab === 'transcript'
              ? 'border-b-2 border-sky-400 text-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Official Transcript & GPA
        </button>
        <button
          onClick={() => setActiveTab('prereqs')}
          className={`pb-3 transition-colors ${
            activeTab === 'prereqs'
              ? 'border-b-2 border-sky-400 text-sky-400 font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Prerequisite Progression Graph
        </button>
      </div>

      {/* TAB 1: Current Courses & Continuous Marks */}
      {activeTab === 'current' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeCourses.map(course => (
            <div
              key={course.section_id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {course.course_code}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1.5">{course.course_title}</h3>
                  <p className="text-xs text-slate-400">Instructor: {course.instructor_name} • {course.credits} Credits</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400 font-mono">
                    {Number(course.continuous_percentage || 0).toFixed(1)}%
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Projected: {course.projected_letter}
                  </span>
                </div>
              </div>

              {/* Progress visualizer */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Number(course.continuous_percentage || 0))}%` }}
                />
              </div>

              {/* Assessments Breakdown List */}
              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assessments Breakdown</div>
                {course.assessments.map(asm => (
                  <div key={asm.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-950/40 border border-slate-800/50">
                    <div>
                      <span className="text-slate-200 font-medium">{asm.name}</span>
                      <span className="text-slate-500 ml-1.5 font-mono">({asm.weight}%)</span>
                    </div>
                    {asm.is_published ? (
                      <span className="font-mono font-bold text-sky-300">
                        {asm.score !== null ? `${asm.score} / ${asm.max_score}` : 'Pending Grading'}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">Grading in Progress</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 2: Official Transcript & Term GPAs */}
      {activeTab === 'transcript' && (
        <div className="space-y-6">
          {transcriptTerms.map(term => (
            <div key={term.semester_name} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
              <div className="flex items-center justify-between px-6 py-4 bg-slate-950/70 border-b border-slate-800">
                <h3 className="text-base font-bold text-white">{term.semester_name}</h3>
                <div className="flex gap-4 text-xs font-mono">
                  <span className="text-slate-400">Term Credits: <strong className="text-slate-200">{term.term_credits}</strong></span>
                  <span className="text-emerald-400">Term GPA: <strong>{Number(term.term_gpa || 0).toFixed(2)}</strong></span>
                </div>
              </div>

              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/40 font-semibold">
                    <th className="py-2.5 px-6">Course</th>
                    <th className="py-2.5 px-4">Title</th>
                    <th className="py-2.5 px-4 text-center">Credits</th>
                    <th className="py-2.5 px-4 text-center">Final %</th>
                    <th className="py-2.5 px-4 text-center">Letter Grade</th>
                    <th className="py-2.5 px-6 text-center">Grade Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {term.courses.map(c => (
                    <tr key={c.course_code} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-6 font-mono font-bold text-sky-400">{c.course_code}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-200">{c.title}</td>
                      <td className="py-2.5 px-4 text-center font-mono">{c.credits}</td>
                      <td className="py-2.5 px-4 text-center font-mono">{Number(c.final_percentage || 0).toFixed(1)}%</td>
                      <td className="py-2.5 px-4 text-center font-bold text-emerald-400">{c.letter_grade}</td>
                      <td className="py-2.5 px-6 text-center font-mono font-bold text-slate-200">{Number(c.grade_points || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: Prerequisite Progression Graph Visualizer */}
      {activeTab === 'prereqs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white">Degree Prerequisite Roadmap</h3>
            <p className="text-xs text-slate-400 mt-1">
              Visualizes locked vs. completed courses according to institutional prerequisite chains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {prerequisiteTree.map(node => {
              const statusStyles = {
                completed: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
                in_progress: 'border-sky-500/40 bg-sky-950/20 text-sky-300',
                unlocked: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
                locked: 'border-slate-800 bg-slate-950/50 text-slate-500 opacity-60',
              }[node.status] || 'border-slate-800 bg-slate-950/50 text-slate-500';

              return (
                <div key={node.course_code} className={`border rounded-xl p-4 space-y-3 transition-all ${statusStyles}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-sm">{node.course_code}</span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border">
                      {node.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-100 text-sm">{node.title}</h4>
                    <p className="text-xs text-slate-400 mt-0.5">{node.credits} Credits</p>
                  </div>
                  {node.grade && (
                    <div className="text-xs font-mono text-emerald-400 font-semibold">
                      Passed with Grade: {node.grade}
                    </div>
                  )}
                  {node.prerequisites && node.prerequisites.length > 0 && (
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                      Prerequisites: <span className="font-mono text-slate-300">{node.prerequisites.join(', ')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
