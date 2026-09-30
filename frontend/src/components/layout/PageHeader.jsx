import React from 'react';
import { Download, Plus, RefreshCw, Filter, Sparkles } from 'lucide-react';
import { Breadcrumbs } from './Breadcrumbs';
import { useLayout } from '../../context/LayoutContext';

/**
 * Enterprise PageHeader Component
 * 
 * Features:
 * - Integrated Breadcrumb navigation
 * - Page Title & Descriptive Subtitle
 * - Role & Term Context Badges
 * - Configurable Context Action Buttons ("Export CSV", "Add New Record", etc.)
 * - Responsive flex wrapping for desktop, tablet, and mobile
 */
export const PageHeader = ({
  title,
  subtitle,
  badges = [],
  actions = [],
  onExportCsv,
  onAddNew,
  onRefresh,
  isRefreshing = false,
  customBreadcrumbs,
}) => {
  const { currentRole, academicTerm } = useLayout();

  return (
    <div className="space-y-3 pb-2 border-b border-slate-800/80">
      {/* Breadcrumb Navigation Trail */}
      <Breadcrumbs customCrumbs={customBreadcrumbs} />

      {/* Main Header Row with Title and Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Title & Metadata Badges */}
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white truncate">
              {title}
            </h1>
            
            {/* Academic Term Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
              {academicTerm}
            </span>

            {/* Active Role Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Role: {currentRole}
            </span>

            {/* Any custom badges passed via props */}
            {badges.map((b, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-medium ${
                  b.variant === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : b.variant === 'warning'
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {b.label}
              </span>
            ))}
          </div>

          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons Toolbar */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap flex-shrink-0">
          {/* Refresh Action */}
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              aria-label="Refresh view data"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-sky-400' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          )}

          {/* Export CSV Action */}
          {onExportCsv && (
            <button
              type="button"
              onClick={onExportCsv}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-sky-400" />
              <span>Export CSV</span>
            </button>
          )}

          {/* Add New Record Action (Primary CTA) */}
          {onAddNew && (
            <button
              type="button"
              onClick={onAddNew}
              className="px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold flex items-center gap-2 transition-all focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-md shadow-sky-600/30"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Record</span>
            </button>
          )}

          {/* Custom actions passed from parent */}
          {actions.map((act, index) => {
            const Icon = act.icon;
            return (
              <button
                key={index}
                type="button"
                onClick={act.onClick}
                className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all focus:outline-none focus:ring-2 ${
                  act.isPrimary
                    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700'
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </div>
  );
};
