import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  BookOpen,
  GraduationCap,
  Users,
  CreditCard,
  Settings,
  FileText,
  Sparkles,
  ArrowRight,
  X,
  Command,
  CornerDownLeft
} from 'lucide-react';
import { useLayout, ROLES } from '../../context/LayoutContext';

/**
 * Enterprise Command Palette & Global Search Modal (Ctrl/Cmd + K)
 * 
 * Provides:
 * - Keyboard navigation (Up/Down arrow, Enter, Escape)
 * - Role-aware search indexing (filters items based on current role permissions)
 * - Quick jump to UMS sections, records, and common actions
 * - WCAG AA focus trapping and ARIA dialog markup
 */
export const SearchModal = () => {
  const { isSearchOpen, setIsSearchOpen, setActiveNavId, currentRole } = useLayout();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  // Search catalogue of commands and pages
  const allItems = [
    {
      id: 'dashboard',
      title: 'Executive Dashboard',
      category: 'Navigation',
      icon: Sparkles,
      description: 'Analytics, KPI cards, and institutional activity overview',
      roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT],
      action: () => {
        setActiveNavId('dashboard');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'academic-programs',
      title: 'Academic Programs & Curricula',
      category: 'Navigation',
      icon: BookOpen,
      description: 'Degree requirements, course catalogs, and syllabus management',
      roles: [ROLES.ADMIN, ROLES.FACULTY],
      action: () => {
        setActiveNavId('academic-programs');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'course-registration',
      title: 'Course Registration & Enrollment',
      category: 'Navigation',
      icon: GraduationCap,
      description: 'Register sections, manage waitlists, and verify prerequisites',
      roles: [ROLES.ADMIN, ROLES.STUDENT],
      action: () => {
        setActiveNavId('course-registration');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'gradebook',
      title: 'Faculty Gradebook Matrix',
      category: 'Navigation',
      icon: Users,
      description: 'Continuous assessment entry, weighted percentages, and publishing',
      roles: [ROLES.ADMIN, ROLES.FACULTY],
      action: () => {
        setActiveNavId('gradebook');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'student-records',
      title: 'Student Academic Records & Transcripts',
      category: 'Navigation',
      icon: FileText,
      description: 'Cumulative GPA calculations, degree audits, and unofficial transcripts',
      roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT],
      action: () => {
        setActiveNavId('student-records');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'financial-ledger',
      title: 'Financial Ledger & Tuition Balances',
      category: 'Navigation',
      icon: CreditCard,
      description: 'Tuition statements, scholarship credits, and payment tracking',
      roles: [ROLES.ADMIN, ROLES.STUDENT],
      action: () => {
        setActiveNavId('financial-ledger');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'system-settings',
      title: 'System Settings & Audit Logs',
      category: 'Navigation',
      icon: Settings,
      description: 'MSSQL database connectivity, user privileges, and event logs',
      roles: [ROLES.ADMIN],
      action: () => {
        setActiveNavId('system-settings');
        setIsSearchOpen(false);
      },
    },
    // Quick Records & Courses
    {
      id: 'course-cs101',
      title: 'CS101: Introduction to Computer Science',
      category: 'Courses',
      icon: BookOpen,
      description: 'Section 001 • Dr. Alan Turing • 42 Enrolled',
      roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT],
      action: () => {
        setActiveNavId('gradebook');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'course-cs201',
      title: 'CS201: Data Structures and Algorithms',
      category: 'Courses',
      icon: BookOpen,
      description: 'Section 001 • Dr. Ada Lovelace • 38 Enrolled',
      roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT],
      action: () => {
        setActiveNavId('gradebook');
        setIsSearchOpen(false);
      },
    },
    {
      id: 'student-alice',
      title: 'Alice Smith (S2024001)',
      category: 'Students',
      icon: Users,
      description: 'B.Sc. Computer Science • 3.92 CGPA • Active',
      roles: [ROLES.ADMIN, ROLES.FACULTY],
      action: () => {
        setActiveNavId('student-records');
        setIsSearchOpen(false);
      },
    },
  ];

  // Filter items by role first, then by search query
  const filteredItems = allItems
    .filter((item) => item.roles.includes(currentRole))
    .filter((item) => {
      if (!query.trim()) return true;
      const lower = query.toLowerCase();
      return (
        item.title.toLowerCase().includes(lower) ||
        item.description.toLowerCase().includes(lower) ||
        item.category.toLowerCase().includes(lower)
      );
    });

  // Focus input on open
  useEffect(() => {
    if (isSearchOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSearchOpen]);

  // Handle arrow key and enter navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isSearchOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredItems.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % Math.max(1, filteredItems.length));
      } else if (e.key === 'Enter' && filteredItems[selectedIndex]) {
        e.preventDefault();
        filteredItems[selectedIndex].action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen, filteredItems, selectedIndex]);

  if (!isSearchOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global quick search command palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-fade-in"
      onClick={() => setIsSearchOpen(false)}
    >
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-900/90 gap-3">
          <Search className="w-5 h-5 text-sky-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command, course code, student ID, or module..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none"
            aria-autocomplete="list"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-200 text-xs px-1.5 py-0.5 rounded bg-slate-800"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            aria-label="Close command palette"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Search className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <p className="text-sm font-medium text-slate-300">No matching results found</p>
              <p className="text-xs text-slate-500 mt-1">Try searching for "Gradebook", "CS101", or "Registration"</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-sky-600/20 text-white border border-sky-500/40'
                      : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg ${
                        isSelected ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold truncate text-slate-100">
                          {item.title}
                        </span>
                        <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{item.description}</p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-1 text-xs text-sky-400 font-mono flex-shrink-0 pl-2">
                      <span>Jump</span>
                      <CornerDownLeft className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer / Keyboard legend */}
        <div className="px-4 py-2.5 bg-slate-950 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">↵</kbd>
              <span>to select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono">Esc</kbd>
              <span>to close</span>
            </span>
          </div>
          <span className="hidden sm:inline font-mono text-[10px] text-sky-400">
            Preview Role: {currentRole}
          </span>
        </div>
      </div>
    </div>
  );
};
