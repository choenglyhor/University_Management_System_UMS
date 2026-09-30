import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useLayout } from '../../context/LayoutContext';

/**
 * Enterprise Breadcrumb Navigation Component
 * 
 * Provides:
 * - Semantic HTML5 `<nav aria-label="Breadcrumb">`
 * - WCAG AA accessible trail with aria-current="page"
 * - Dynamic path derivation from active navigation and sub-navigation IDs
 * - Full Dark / Light mode styling
 */
export const Breadcrumbs = ({ customCrumbs }) => {
  const { activeNavId, setActiveNavId } = useLayout();

  const routeMap = {
    dashboard: { label: 'Dashboard', parent: 'Overview' },
    'academic-programs': { label: 'Academic Programs', parent: 'Academics' },
    'course-registration': { label: 'Course Registration', parent: 'Academics' },
    gradebook: { label: 'Faculty Gradebook', parent: 'Academics' },
    'student-records': { label: 'Student Records', parent: 'Records & Finance' },
    'financial-ledger': { label: 'Financial Ledger', parent: 'Records & Finance' },
    'system-settings': { label: 'System Settings', parent: 'Administration' },
  };

  const currentRoute = routeMap[activeNavId] || { label: 'Dashboard', parent: 'Overview' };

  const defaultCrumbs = [
    { id: 'root', label: 'UMS Portal', isHome: true, onClick: () => setActiveNavId('dashboard') },
    { id: 'parent', label: currentRoute.parent },
    { id: 'current', label: currentRoute.label, isCurrent: true },
  ];

  const crumbs = customCrumbs || defaultCrumbs;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-slate-500 dark:text-slate-400">
      <ol className="flex items-center space-x-2">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li key={crumb.id || index} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 mx-1 flex-shrink-0" />
              )}
              {crumb.isHome ? (
                <button
                  type="button"
                  onClick={crumb.onClick}
                  className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-slate-200 text-slate-600 dark:text-slate-400 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-0.5"
                  aria-label="Go to UMS Portal home"
                >
                  <Home className="w-3.5 h-3.5 text-sky-500" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{crumb.label}</span>
                </button>
              ) : isLast || crumb.isCurrent ? (
                <span
                  className="font-bold text-slate-900 dark:text-slate-100 px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800/40 border border-slate-300 dark:border-slate-700/50"
                  aria-current="page"
                >
                  {crumb.label}
                </span>
              ) : crumb.onClick ? (
                <button
                  type="button"
                  onClick={crumb.onClick}
                  className="hover:text-slate-900 dark:hover:text-slate-200 text-slate-600 dark:text-slate-400 transition-colors focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1 py-0.5"
                >
                  {crumb.label}
                </button>
              ) : (
                <span className="text-slate-500 dark:text-slate-400 px-1 py-0.5">{crumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
