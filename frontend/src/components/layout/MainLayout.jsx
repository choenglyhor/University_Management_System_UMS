import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { SearchModal } from './SearchModal';
import { useLayout } from '../../context/LayoutContext';

/**
 * Enterprise MainLayout Shell
 * 
 * Orchestrates:
 * 1. Accessibility: Skip-to-main-content landmark link for keyboard / screen-reader users
 * 2. Sticky Top Navbar with logo, search trigger, notifications, term, and profile
 * 3. Responsive Collapsible Sidebar (sliding drawer on mobile, icon-rail / expanded on desktop)
 * 4. Command Palette Search Modal (Ctrl/Cmd + K)
 * 5. Semantic `<main id="main-content">` Canvas with dynamic margin offset
 * 6. Standardized institutional footer
 */
export const MainLayout = ({ children }) => {
  const { isDesktopCollapsed } = useLayout();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-white">
      
      {/* WCAG AA: Accessible Skip to Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-sky-600 focus:text-white focus:rounded-xl focus:shadow-2xl focus:outline-none focus:ring-2 focus:ring-white text-xs font-bold"
      >
        Skip to main content
      </a>

      {/* Global Command Palette Modal */}
      <SearchModal />

      {/* Sticky Top Navbar */}
      <Navbar />

      {/* Primary Layout Shell Area (Sidebar + Main Canvas) */}
      <div className="flex-1 flex">
        {/* Collapsible Left Navigation Sidebar */}
        <Sidebar />

        {/* Semantic Main Content Canvas */}
        <main
          id="main-content"
          tabIndex={-1}
          role="main"
          className={`flex-1 transition-all duration-300 ease-in-out min-h-[calc(100vh-4rem)] flex flex-col focus:outline-none ${
            isDesktopCollapsed ? 'lg:pl-20' : 'lg:pl-64'
          }`}
        >
          {/* Responsive Page Content Wrapper */}
          <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {children}
          </div>

          {/* Institutional Shell Footer */}
          <footer className="mt-auto border-t border-slate-900 bg-slate-950/80 py-4 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
              <p>
                © 2026 Western University • Academic Management System (UMS/SIS Enterprise)
              </p>
              <div className="flex items-center gap-3 font-mono text-[11px]">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  MSSQL Connected
                </span>
                <span>•</span>
                <span>Tailwind CSS + React</span>
              </div>
            </div>
          </footer>
        </main>
      </div>

    </div>
  );
};
