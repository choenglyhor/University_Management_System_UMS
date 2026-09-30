import React, { useState } from 'react';
import { BookOpen, GraduationCap, CheckCircle2, ChevronRight, Layers, Award, FileText } from 'lucide-react';
import { PageHeader } from '../layout/PageHeader';
import { useLayout } from '../../context/LayoutContext';

export const AcademicProgramsView = () => {
  const { currentRole } = useLayout();
  const [selectedDept, setSelectedDept] = useState('ALL');

  const programs = [
    {
      code: 'BS-CS',
      title: 'Bachelor of Science in Computer Science',
      department: 'Computer Science',
      faculty: 'Faculty of Science & Engineering',
      credits: 120,
      duration: '4 Years (8 Semesters)',
      accreditation: 'ABET Accredited',
      concentrations: ['Artificial Intelligence', 'Distributed Systems', 'Software Engineering'],
      enrolledCount: 480,
    },
    {
      code: 'BS-SE',
      title: 'Bachelor of Science in Software Engineering',
      department: 'Software Engineering',
      faculty: 'Faculty of Science & Engineering',
      credits: 128,
      duration: '4 Years (8 Semesters)',
      accreditation: 'ABET Accredited',
      concentrations: ['Cloud Computing', 'Cybersecurity', 'Enterprise Architecture'],
      enrolledCount: 350,
    },
    {
      code: 'MS-DS',
      title: 'Master of Science in Data Science',
      department: 'Computer Science',
      faculty: 'Graduate School of Computing',
      credits: 36,
      duration: '2 Years (4 Semesters)',
      accreditation: 'Regional Board Certified',
      concentrations: ['Deep Learning', 'Big Data Engineering', 'Bioinformatics'],
      enrolledCount: 140,
    },
    {
      code: 'BBA-FIN',
      title: 'Bachelor of Business Administration (Finance)',
      department: 'Finance & Banking',
      faculty: 'School of Business Management',
      credits: 120,
      duration: '4 Years (8 Semesters)',
      accreditation: 'AACSB Accredited',
      concentrations: ['Fintech & Blockchain', 'Corporate Valuation', 'Asset Management'],
      enrolledCount: 520,
    },
  ];

  const filteredPrograms = selectedDept === 'ALL'
    ? programs
    : programs.filter(p => p.department === selectedDept);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Programs & Curricula"
        subtitle="Institutional curriculum catalogs, accreditation tracking, and degree completion guidelines."
        onExportCsv={() => alert('Exporting program syllabi to CSV...')}
        onAddNew={currentRole === 'Admin' ? () => alert('Adding new curriculum program...') : null}
      />

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Department:</span>
          {['ALL', 'Computer Science', 'Software Engineering', 'Finance & Banking'].map((dept) => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedDept === dept
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
        <span className="text-xs font-mono text-slate-400">
          Showing {filteredPrograms.length} Academic Programs
        </span>
      </div>

      {/* Program Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredPrograms.map((prog) => (
          <div
            key={prog.code}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <span className="font-mono text-xs font-bold text-sky-400 bg-sky-500/10 px-2.5 py-0.5 rounded border border-sky-500/20">
                  {prog.code}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {prog.accreditation}
                </span>
              </div>

              <h3 className="text-lg font-bold text-white">{prog.title}</h3>
              <p className="text-xs text-slate-400">{prog.faculty} • {prog.department}</p>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950/60 p-3 rounded-xl border border-slate-800 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">TOTAL CREDITS:</span>
                  <span className="text-white font-bold">{prog.credits} Units</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">DURATION:</span>
                  <span className="text-white font-bold">{prog.duration}</span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                  Available Concentrations:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {prog.concentrations.map((c) => (
                    <span
                      key={c}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-mono">
                Active Enrolled: <strong className="text-white">{prog.enrolledCount}</strong>
              </span>
              <button
                onClick={() => alert(`Viewing curriculum mapping for ${prog.code}`)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-sky-400 hover:text-white flex items-center gap-1 transition-colors"
              >
                <span>Curriculum Map</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
