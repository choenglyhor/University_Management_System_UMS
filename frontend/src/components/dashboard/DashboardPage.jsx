import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Shield,
  FileSpreadsheet,
  CreditCard,
  Server,
  Calendar,
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { PageHeader } from '../layout/PageHeader';
import { useLayout, ROLES } from '../../context/LayoutContext';

/**
 * Enterprise Dashboard Page Component
 * 
 * Features:
 * - Dynamic Role-Adaptive KPI Metric Cards (Admin, Faculty, Student views)
 * - Interactive Role-Switcher Preview banner allowing real-time inspection
 * - Actionable quick launchpad shortcuts
 * - Recent transaction / academic activity audit logs
 * - Institutional deadline timeline & MSSQL infrastructure heartbeat
 */
export const DashboardPage = ({ onNavigateToSection }) => {
  const { currentRole, setCurrentRole, currentProfile, academicTerm, setActiveNavId } = useLayout();

  // Role-specific KPI metrics
  const getKpiCards = () => {
    switch (currentRole) {
      case ROLES.ADMIN:
        return [
          {
            title: 'Total Active Students',
            value: '14,820',
            trend: '+4.8% vs last term',
            isPositive: true,
            icon: Users,
            color: 'sky',
          },
          {
            title: 'Active Faculty Members',
            value: '482',
            trend: '98% syllabus certified',
            isPositive: true,
            icon: UserCheck,
            color: 'indigo',
          },
          {
            title: 'Tuition Fees Collected',
            value: '$48.2M',
            trend: '94.2% term collection rate',
            isPositive: true,
            icon: CreditCard,
            color: 'emerald',
          },
          {
            title: 'MSSQL Query Latency',
            value: '12 ms',
            trend: '99.99% uptime HA replica',
            isPositive: true,
            icon: Server,
            color: 'amber',
          },
        ];
      case ROLES.FACULTY:
        return [
          {
            title: 'Assigned Course Sections',
            value: '3 Sections',
            trend: 'CS101, CS201, SE301',
            isPositive: true,
            icon: BookOpen,
            color: 'sky',
          },
          {
            title: 'Total Roster Students',
            value: '115 Students',
            trend: 'Avg attendance 94%',
            isPositive: true,
            icon: Users,
            color: 'indigo',
          },
          {
            title: 'Pending Grade Submissions',
            value: '1 Section',
            trend: 'Midterm 2 due in 3 days',
            isPositive: false,
            icon: AlertCircle,
            color: 'amber',
          },
          {
            title: 'Section Average Score',
            value: '88.4%',
            trend: '+3.1% higher than dept avg',
            isPositive: true,
            icon: TrendingUp,
            color: 'emerald',
          },
        ];
      case ROLES.STUDENT:
        return [
          {
            title: 'Cumulative GPA (CGPA)',
            value: '3.92',
            trend: 'Dean’s Honor List',
            isPositive: true,
            icon: GraduationCap,
            color: 'sky',
          },
          {
            title: 'Degree Credits Earned',
            value: '34 / 120',
            trend: '28.3% Completed (Junior)',
            isPositive: true,
            icon: BookOpen,
            color: 'indigo',
          },
          {
            title: 'Active Registered Courses',
            value: '4 Courses',
            trend: '16 credits enrolled',
            isPositive: true,
            icon: Calendar,
            color: 'emerald',
          },
          {
            title: 'Account Balance Due',
            value: '$0.00',
            trend: 'Tuition fully cleared',
            isPositive: true,
            icon: CreditCard,
            color: 'amber',
          },
        ];
      default:
        return [];
    }
  };

  // Recent activity logs based on role
  const getRecentActivities = () => {
    switch (currentRole) {
      case ROLES.ADMIN:
        return [
          {
            id: 'act-1',
            title: 'Batch Enrollment Finalized',
            description: '142 incoming freshmen enrolled into CS101 Section 001/002.',
            time: '12 mins ago',
            status: 'success',
          },
          {
            id: 'act-2',
            title: 'MSSQL High Availability Check',
            description: 'Database secondary replica synchronized without replication delay.',
            time: '45 mins ago',
            status: 'info',
          },
          {
            id: 'act-3',
            title: 'Fee Waiver Approved',
            description: 'Merit scholarship waiver applied to Student S2024001.',
            time: '2 hours ago',
            status: 'success',
          },
          {
            id: 'act-4',
            title: 'Prerequisite Exception Logged',
            description: 'Chair override granted for SE401 prerequisite barrier.',
            time: '4 hours ago',
            status: 'warning',
          },
        ];
      case ROLES.FACULTY:
        return [
          {
            id: 'act-1',
            title: 'Continuous Assessment Updated',
            description: 'Saved batch marks for Midterm Exam (CS101-001).',
            time: '25 mins ago',
            status: 'success',
          },
          {
            id: 'act-2',
            title: 'Waitlist Seat Released',
            description: 'Alice Smith auto-promoted to registered roster in SE301.',
            time: '1 hour ago',
            status: 'info',
          },
          {
            id: 'act-3',
            title: 'Grade Audit Lock Reminder',
            description: 'Midterm grade submission locks on Friday at 23:59.',
            time: '3 hours ago',
            status: 'warning',
          },
        ];
      case ROLES.STUDENT:
        return [
          {
            id: 'act-1',
            title: 'Grade Released: CS101 Midterm',
            description: 'Score: 92/100 (Weight: 35%). Class average: 78.4.',
            time: '1 hour ago',
            status: 'success',
          },
          {
            id: 'act-2',
            title: 'Course Enrollment Confirmed',
            description: 'Registered into CS201 - Data Structures & Algorithms.',
            time: 'Yesterday',
            status: 'info',
          },
          {
            id: 'act-3',
            title: 'Tuition Receipt Generated',
            description: 'Official invoice #INV-2026-089 for Fall 2026 archived.',
            time: '2 days ago',
            status: 'success',
          },
        ];
      default:
        return [];
    }
  };

  const kpis = getKpiCards();
  const activities = getRecentActivities();

  return (
    <div className="space-y-6">
      {/* Semantic Page Header */}
      <PageHeader
        title={`${currentRole} Command Dashboard`}
        subtitle={`Welcome back, ${currentProfile.name}. Here is the real-time operational overview for Western University during ${academicTerm}.`}
        onExportCsv={() => alert('Exporting dashboard metrics report to CSV...')}
        onAddNew={() => alert('Opening Add Record dialogue...')}
        onRefresh={() => alert('Syncing institutional records with MSSQL Server...')}
      />

      {/* ROLE-BASED UI VISIBILITY TOGGLE BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-indigo-950/60 border border-sky-500/30 shadow-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-white flex items-center gap-2">
              <span>Interactive Role Previewer</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Live Simulation
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Toggle viewports and user permissions to test sidebar hierarchy, KPIs, and restricted operations.
            </p>
          </div>
        </div>

        {/* Role Toggle Button Group */}
        <div className="flex items-center p-1 bg-slate-950/90 rounded-xl border border-slate-800 flex-shrink-0 self-start sm:self-auto">
          {Object.values(ROLES).map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setCurrentRole(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                currentRole === role
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* KPI METRIC CARDS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 shadow-sm transition-all flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <div
                  className={`p-2 rounded-xl ${
                    card.color === 'sky'
                      ? 'bg-sky-500/10 text-sky-400'
                      : card.color === 'indigo'
                      ? 'bg-indigo-500/10 text-indigo-400'
                      : card.color === 'emerald'
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-amber-500/10 text-amber-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="mt-4">
                <div className="text-2xl font-extrabold text-white tracking-tight">
                  {card.value}
                </div>
                <div className="flex items-center gap-1.5 mt-1 text-xs">
                  {card.isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span className={card.isPositive ? 'text-emerald-400' : 'text-amber-400'}>
                    {card.trend}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUICK LAUNCHPAD ACTIONS */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span>Fast Action Launchpad</span>
            <span className="text-[10px] font-mono text-sky-400">({currentRole} Scope)</span>
          </h2>
          <span className="text-xs text-slate-400">Frequently used institutional modules</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {currentRole === ROLES.ADMIN && (
            <>
              <button
                type="button"
                onClick={() => setActiveNavId('gradebook')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <FileSpreadsheet className="w-5 h-5 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-white">Review Gradebook</div>
                <div className="text-[11px] text-slate-400">Verify assessment matrices</div>
              </button>
              <button
                type="button"
                onClick={() => setActiveNavId('course-registration')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <GraduationCap className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-white">Course Catalog</div>
                <div className="text-[11px] text-slate-400">Inspect waitlists & seats</div>
              </button>
              <button
                type="button"
                onClick={() => setActiveNavId('student-records')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <Users className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-white">Student Records</div>
                <div className="text-[11px] text-slate-400">GPA and transcript verification</div>
              </button>
              <button
                type="button"
                onClick={() => setActiveNavId('system-settings')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <Server className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-white">MSSQL High Availability</div>
                <div className="text-[11px] text-slate-400">Replication & lock monitor</div>
              </button>
            </>
          )}

          {currentRole === ROLES.FACULTY && (
            <>
              <button
                type="button"
                onClick={() => setActiveNavId('gradebook')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <FileSpreadsheet className="w-5 h-5 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-white">Enter Grades (CS101)</div>
                <div className="text-[11px] text-slate-400">Continuous matrix assessment</div>
              </button>
              <button
                type="button"
                onClick={() => setActiveNavId('academic-programs')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <BookOpen className="w-5 h-5 text-indigo-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-white">Syllabus Management</div>
                <div className="text-[11px] text-slate-400">Update curriculum weights</div>
              </button>
              <button
                type="button"
                onClick={() => setActiveNavId('student-records')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <Users className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-white">Advisee Roster</div>
                <div className="text-[11px] text-slate-400">Check academic standing</div>
              </button>
              <button
                type="button"
                onClick={() => setActiveNavId('course-registration')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <GraduationCap className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-white">Department Catalog</div>
                <div className="text-[11px] text-slate-400">Browse prerequisites tree</div>
              </button>
            </>
          )}

          {currentRole === ROLES.STUDENT && (
            <>
              <button
                type="button"
                onClick={() => setActiveNavId('student-records')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <GraduationCap className="w-5 h-5 text-sky-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-white">My Academic Portal</div>
                <div className="text-[11px] text-slate-400">Check GPA & transcripts</div>
              </button>
              <button
                type="button"
                onClick={() => setActiveNavId('course-registration')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <BookOpen className="w-5 h-5 text-emerald-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-white">Course Registration</div>
                <div className="text-[11px] text-slate-400">Enroll or drop sections</div>
              </button>
              <button
                type="button"
                onClick={() => setActiveNavId('financial-ledger')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <CreditCard className="w-5 h-5 text-amber-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-white">Tuition & Fees</div>
                <div className="text-[11px] text-slate-400">View statement & receipts</div>
              </button>
              <button
                type="button"
                onClick={() => alert('Generating unofficial transcript PDF...')}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-left transition-all group"
              >
                <ArrowUpRight className="w-5 h-5 text-purple-400 mb-2 group-hover:scale-110 transition-transform" />
                <div className="text-xs font-bold text-white">Download Transcript</div>
                <div className="text-[11px] text-slate-400">Official institutional seal</div>
              </button>
            </>
          )}
        </div>
      </div>

      {/* TWO-COLUMN DETAILS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols wide on desktop): Recent Activity & Audit Trail */}
        <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Recent System Activity & Audit Trail</h3>
              <p className="text-xs text-slate-400">Real-time event logging synchronized with MSSQL engine</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Auto-refresh 30s
            </span>
          </div>

          <div className="space-y-3">
            {activities.map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 flex items-start gap-3 transition-colors"
              >
                <div className="pt-0.5">
                  {act.status === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {act.status === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400" />}
                  {act.status === 'info' && <Clock className="w-4 h-4 text-sky-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white">{act.title}</h4>
                    <span className="text-[10px] font-mono text-slate-400 flex-shrink-0">{act.time}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{act.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Deadlines & Institutional Timeline */}
        <div className="space-y-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>Term Deadlines ({academicTerm})</span>
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-amber-400 font-bold">
                  <span>Midterm Grade Entry</span>
                  <span className="font-mono text-[10px]">Oct 15, 2026</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Faculty assessment locks engage at midnight.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-sky-400 font-bold">
                  <span>Course Withdrawal Deadline</span>
                  <span className="font-mono text-[10px]">Nov 01, 2026</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Last day to withdraw without academic penalty ('W' grade).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex items-center justify-between text-emerald-400 font-bold">
                  <span>Spring 2027 Registration</span>
                  <span className="font-mono text-[10px]">Nov 20, 2026</span>
                </div>
                <p className="text-slate-400 text-[11px] mt-1">
                  Senior priority enrollment begins at 08:00 EST.
                </p>
              </div>
            </div>
          </div>

          {/* Engine Architecture Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm text-xs font-mono space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-bold">
              <span className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-sky-400" />
                <span>Database Engine</span>
              </span>
              <span className="text-emerald-400 text-[11px]">MSSQL 2022</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1 pt-1 border-t border-slate-800">
              <div className="flex justify-between">
                <span>Concurrency Lock:</span>
                <span className="text-slate-300">T-SQL UPDLOCK</span>
              </div>
              <div className="flex justify-between">
                <span>Transaction Isolation:</span>
                <span className="text-slate-300">READ COMMITTED SNAPSHOT</span>
              </div>
              <div className="flex justify-between">
                <span>Replication Status:</span>
                <span className="text-emerald-400">Synchronized (0 lag)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
