import React, { useState, useRef, useCallback } from 'react';

export const FacultyGradebookMatrix = ({
  sectionId,
  courseCode,
  sectionNumber,
  initialAssessments = [],
  initialStudents = [],
  onSaveBatch,
  onPublishFinal,
}) => {
  const [assessments, setAssessments] = useState(initialAssessments);
  const [students, setStudents] = useState(initialStudents);
  const [syncStatus, setSyncStatus] = useState('saved');
  const [pendingChanges, setPendingChanges] = useState(new Map());

  const debounceTimerRef = useRef(null);
  const inputRefs = useRef({});

  // 1. Projected Grade Calculator
  const computeStudentStats = (scores) => {
    let earnedWeight = 0;
    let attemptedWeight = 0;

    assessments.forEach(asm => {
      const score = scores ? scores[asm.id] : null;
      if (score !== null && score !== undefined) {
        const ratio = score / asm.max_score;
        earnedWeight += ratio * asm.weight_percentage;
        attemptedWeight += asm.weight_percentage;
      }
    });

    const projectedPct = attemptedWeight > 0 ? (earnedWeight / attemptedWeight) * 100 : 0;

    // Scale mapping
    let letter = 'F';
    let gpa = 0.0;
    if (projectedPct >= 93) { letter = 'A'; gpa = 4.0; }
    else if (projectedPct >= 90) { letter = 'A-'; gpa = 3.7; }
    else if (projectedPct >= 87) { letter = 'B+'; gpa = 3.3; }
    else if (projectedPct >= 83) { letter = 'B'; gpa = 3.0; }
    else if (projectedPct >= 80) { letter = 'B-'; gpa = 2.7; }
    else if (projectedPct >= 77) { letter = 'C+'; gpa = 2.3; }
    else if (projectedPct >= 73) { letter = 'C'; gpa = 2.0; }
    else if (projectedPct >= 70) { letter = 'C-'; gpa = 1.7; }
    else if (projectedPct >= 65) { letter = 'D+'; gpa = 1.3; }
    else if (projectedPct >= 60) { letter = 'D'; gpa = 1.0; }

    return {
      earnedWeight: Number(earnedWeight.toFixed(2)),
      projectedPct: Number(projectedPct.toFixed(1)),
      letter,
      gpa,
    };
  };

  // 2. Debounced Auto-Save Pipeline (500ms)
  const triggerAutoSave = useCallback(
    (changes) => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      setSyncStatus('unsaved');

      debounceTimerRef.current = setTimeout(async () => {
        if (changes.size === 0) return;
        setSyncStatus('saving');
        try {
          const payload = Array.from(changes.values()).map(c => ({
            enrollment_id: c.enrollment_id,
            assessment_id: c.assessment_id,
            score_obtained: c.score,
          }));
          if (onSaveBatch) {
            await onSaveBatch(payload);
          }
          setPendingChanges(new Map());
          setSyncStatus('saved');
        } catch (err) {
          console.error('Autosave sync failed:', err);
          setSyncStatus('error');
        }
      }, 500);
    },
    [onSaveBatch]
  );

  // 3. Handle Score Change with Validation
  const handleScoreChange = (enrollmentId, assessmentId, rawValue) => {
    const asm = assessments.find(a => a.id === assessmentId);
    if (!asm) return;

    let parsedVal = rawValue === '' ? null : parseFloat(rawValue);

    if (parsedVal !== null && !isNaN(parsedVal)) {
      if (parsedVal < 0) parsedVal = 0;
      if (parsedVal > asm.max_score) parsedVal = asm.max_score;
    } else {
      parsedVal = null;
    }

    setStudents(prev =>
      prev.map(st => {
        if (st.enrollment_id === enrollmentId) {
          return {
            ...st,
            scores: {
              ...st.scores,
              [assessmentId]: parsedVal,
            },
          };
        }
        return st;
      })
    );

    if (parsedVal !== null) {
      const key = `${enrollmentId}_${assessmentId}`;
      const newPending = new Map(pendingChanges);
      newPending.set(key, { enrollment_id: enrollmentId, assessment_id: assessmentId, score: parsedVal });
      setPendingChanges(newPending);
      triggerAutoSave(newPending);
    }
  };

  // 4. Keyboard Navigation (Spreadsheet Grid: Arrows & Enter/Tab)
  const handleKeyDown = (e, rowIndex, colIndex) => {
    let targetRow = rowIndex;
    let targetCol = colIndex;

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault();
        targetRow = Math.max(0, rowIndex - 1);
        break;
      case 'ArrowDown':
      case 'Enter':
        e.preventDefault();
        targetRow = Math.min(students.length - 1, rowIndex + 1);
        break;
      case 'ArrowLeft':
        if (e.currentTarget.selectionStart === 0) {
          e.preventDefault();
          targetCol = Math.max(0, colIndex - 1);
        }
        break;
      case 'ArrowRight':
        if (e.currentTarget.selectionEnd === e.currentTarget.value.length) {
          e.preventDefault();
          targetCol = Math.min(assessments.length - 1, colIndex + 1);
        }
        break;
      default:
        return;
    }

    const nextRefKey = `${targetRow}_${targetCol}`;
    inputRefs.current[nextRefKey]?.focus();
    inputRefs.current[nextRefKey]?.select();
  };

  // 5. CSV Export
  const exportToCSV = () => {
    const headers = ['Student ID', 'Full Name', ...assessments.map(a => `${a.name} (${a.weight_percentage}%)`), 'Weighted Total %', 'Projected Grade'];
    const rows = students.map(st => {
      const stats = computeStudentStats(st.scores);
      const studentScores = assessments.map(a => st.scores[a.id] ?? '');
      return [st.student_number, `"${st.full_name}"`, ...studentScores, stats.projectedPct, stats.letter].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Gradebook_${courseCode}_Sec${sectionNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Total syllabus weight check
  const totalWeight = assessments.reduce((sum, a) => sum + (Number(a.weight_percentage) || 0), 0);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-6 text-slate-100">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {courseCode} - Section {sectionNumber}
            </h1>
            <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
              totalWeight === 100 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            }`}>
              Weight Total: {totalWeight.toFixed(1)}% {totalWeight === 100 ? '✓' : '(Must be 100%)'}
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">Continuous Assessment Matrix & Final Gradebook</p>
        </div>

        {/* Action Controls & Sync Status */}
        <div className="flex items-center gap-4">
          {/* Sync indicator */}
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700">
            {syncStatus === 'saved' && (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                <span className="text-slate-300">All changes saved</span>
              </>
            )}
            {syncStatus === 'saving' && (
              <>
                <svg className="animate-spin w-3 h-3 text-sky-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span className="text-sky-300">Saving...</span>
              </>
            )}
            {syncStatus === 'unsaved' && (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                <span className="text-amber-300">Unsaved changes</span>
              </>
            )}
            {syncStatus === 'error' && (
              <>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <span className="text-rose-400">Sync failed!</span>
              </>
            )}
          </div>

          <button
            onClick={exportToCSV}
            className="px-3.5 py-1.5 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg transition-colors flex items-center gap-1.5"
          >
            Export CSV
          </button>

          <button
            onClick={onPublishFinal}
            disabled={totalWeight !== 100}
            className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:border-slate-800 text-white rounded-lg shadow-lg shadow-emerald-600/20 transition-all border border-emerald-500"
          >
            Finalize & Publish Grades
          </button>
        </div>
      </div>

      {/* Spreadsheet Matrix Table */}
      <div className="overflow-x-auto mt-6 rounded-lg border border-slate-800">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium">
              <th className="py-3 px-4 sticky left-0 bg-slate-950/95 z-10 w-24">ID</th>
              <th className="py-3 px-4 sticky left-24 bg-slate-950/95 z-10 w-48">Student Name</th>
              {assessments.map(asm => (
                <th key={asm.id} className="py-3 px-3 text-center min-w-[130px] border-l border-slate-800/60">
                  <div className="font-semibold text-slate-200">{asm.name}</div>
                  <div className="text-[11px] text-slate-400">
                    Max: {asm.max_score} | {asm.weight_percentage}%
                  </div>
                </th>
              ))}
              <th className="py-3 px-4 text-center min-w-[110px] bg-slate-950/95 border-l border-slate-700 text-sky-400">
                Score %
              </th>
              <th className="py-3 px-4 text-center min-w-[90px] bg-slate-950/95 text-emerald-400">
                Grade
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
            {students.map((student, rowIndex) => {
              const stats = computeStudentStats(student.scores);

              return (
                <tr key={student.enrollment_id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="py-2.5 px-4 font-mono text-xs text-slate-400 sticky left-0 bg-slate-900 group-hover:bg-slate-800/80 z-10">
                    {student.student_number}
                  </td>
                  <td className="py-2.5 px-4 font-medium text-slate-200 sticky left-24 bg-slate-900 group-hover:bg-slate-800/80 z-10">
                    {student.full_name}
                  </td>
                  {assessments.map((asm, colIndex) => {
                    const cellKey = `${rowIndex}_${colIndex}`;
                    const score = student.scores ? student.scores[asm.id] : null;

                    return (
                      <td key={asm.id} className="py-1.5 px-2 text-center border-l border-slate-800/50">
                        <input
                          ref={el => (inputRefs.current[cellKey] = el)}
                          type="number"
                          step="0.5"
                          min="0"
                          max={asm.max_score}
                          value={score !== null && score !== undefined ? score : ''}
                          onChange={e => handleScoreChange(student.enrollment_id, asm.id, e.target.value)}
                          onKeyDown={e => handleKeyDown(e, rowIndex, colIndex)}
                          placeholder="-"
                          className="w-20 text-center font-mono text-sm py-1 px-1.5 bg-slate-950/60 hover:bg-slate-950 focus:bg-slate-950 border border-slate-700/80 focus:border-sky-500 rounded text-slate-100 outline-none transition-colors"
                        />
                      </td>
                    );
                  })}
                  <td className="py-2 px-4 text-center font-mono font-semibold text-sky-300 border-l border-slate-700 bg-slate-950/30">
                    {stats.projectedPct}%
                  </td>
                  <td className="py-2 px-4 text-center font-bold text-emerald-400 bg-slate-950/30">
                    {stats.letter} ({stats.gpa.toFixed(1)})
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
