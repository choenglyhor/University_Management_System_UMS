import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  X,
  Search,
  Bell,
  GraduationCap,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ChevronDown,
  User,
  Shield,
  LogOut,
  Settings,
  Sparkles,
  Layers,
  Check
} from 'lucide-react';
import { useLayout, ROLES } from '../../context/LayoutContext';

/**
 * Enterprise University Management System (UMS) - Sticky Top Navbar
 * 
 * Features:
 * - Brand logo & Institution Branding
 * - Responsive Mobile Drawer Trigger (< 1024px)
 * - Quick Search Bar Trigger (Cmd/Ctrl + K command palette)
 * - Academic Term Indicator ('Fall 2026')
 * - Notification Center with Unread Counter Badge & Dropdown Panel
 * - User Profile Dropdown with Interactive Role Switcher (Admin / Faculty / Student)
 * - Full WCAG AA Contrast Compliance & Keyboard Trapping
 */
export const Navbar = () => {
  const {
    currentRole,
    setCurrentRole,
    currentProfile,
    toggleMobileSidebar,
    isMobileSidebarOpen,
    setIsSearchOpen,
    academicTerm,
    setAcademicTerm,
    notifications,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
  } = useLayout();

  // Dropdown states
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isTermOpen, setIsTermOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const termRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (termRef.current && !termRef.current.contains(event.target)) {
        setIsTermOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Available academic terms
  const terms = [
    { label: 'Fall 2026', status: 'Active Term', isCurrent: true },
    { label: 'Spring 2027', status: 'Upcoming Registration', isCurrent: false },
    { label: 'Summer 2026', status: 'Archived / Read-only', isCurrent: false },
  ];

  return (
    <header
      role="banner"
      className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left Section: Mobile Menu Button & Institution Brand */}
        <div className="flex items-center gap-3">
          {/* Mobile Sliding Drawer Hamburger (< 1024px) */}
          <button
            type="button"
            onClick={toggleMobileSidebar}
            aria-label={isMobileSidebarOpen ? 'Close navigation drawer' : 'Open navigation drawer'}
            aria-expanded={isMobileSidebarOpen}
            className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Institution Brand Identity */}
          <div className="flex items-center gap-3 select-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 flex-shrink-0">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base tracking-tight text-white">
                  Western University
                </span>
                <span className="hidden sm:inline-flex items-center text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/30">
                  UMS Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                Academic Operations & Student Information System
              </p>
            </div>
          </div>
        </div>

        {/* Center Section: Quick Search Bar Trigger (Ctrl/Cmd + K) */}
        <div className="flex-1 max-w-md mx-2 hidden sm:block">
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            aria-keyshortcuts="Control+K"
            aria-label="Quick search (Press Ctrl+K)"
            className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-xs text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 group"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
              <span>Search courses, students, grade records...</span>
            </span>
            <kbd className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
        </div>

        {/* Right Section: Mobile search button, Academic Term, Notifications, and Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Mobile search icon trigger (< 640px) */}
          <button
            type="button"
            onClick={() => setIsSearchOpen(true)}
            aria-label="Open search command palette"
            className="sm:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Academic Term Indicator with selector dropdown */}
          <div className="relative" ref={termRef}>
            <button
              type="button"
              onClick={() => setIsTermOpen((prev) => !prev)}
              aria-expanded={isTermOpen}
              aria-label={`Academic Term: ${academicTerm}`}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <Calendar className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
              <span className="hidden md:inline font-mono font-semibold text-slate-200">{academicTerm}</span>
              <span className="md:hidden font-mono text-xs">{academicTerm.split(' ')[0]}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isTermOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 animate-fade-in"
              >
                <div className="px-3 py-1.5 text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  Select Academic Term
                </div>
                <div className="mt-1 space-y-1">
                  {terms.map((t) => (
                    <button
                      key={t.label}
                      onClick={() => {
                        setAcademicTerm(t.label);
                        setIsTermOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                        academicTerm === t.label
                          ? 'bg-sky-600/20 text-sky-300 font-semibold border border-sky-500/30'
                          : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-mono">{t.label}</div>
                        <div className="text-[10px] text-slate-400">{t.status}</div>
                      </div>
                      {academicTerm === t.label && <Check className="w-4 h-4 text-sky-400" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Notification Center with unread badge */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={() => setIsNotifOpen((prev) => !prev)}
              aria-label={`Notifications: ${unreadCount} unread`}
              aria-expanded={isNotifOpen}
              className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-slate-900 animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {isNotifOpen && (
              <div
                role="region"
                aria-label="Notifications panel"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fade-in"
              >
                <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-white">System Alerts</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-sky-500/20 text-sky-400 text-[10px] font-mono font-bold">
                      {unreadCount} new
                    </span>
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllNotificationsRead}
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-medium transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                  {notifications.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                      No notifications for the current academic session.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-800/70 flex gap-3 ${
                          n.unread ? 'bg-sky-950/20' : 'bg-transparent'
                        }`}
                      >
                        <div className="pt-0.5 flex-shrink-0">
                          {n.category === 'academic' && <AlertCircle className="w-4 h-4 text-amber-400" />}
                          {n.category === 'registration' && <GraduationCap className="w-4 h-4 text-sky-400" />}
                          {n.category === 'finance' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                          {n.category === 'system' && <Layers className="w-4 h-4 text-indigo-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className={`font-semibold truncate ${n.unread ? 'text-white' : 'text-slate-300'}`}>
                              {n.title}
                            </h4>
                            <span className="text-[10px] text-slate-500 font-mono flex-shrink-0">{n.timestamp}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{n.description}</p>
                        </div>
                        {n.unread && (
                          <div className="pt-1.5 flex-shrink-0">
                            <span className="w-2 h-2 rounded-full bg-sky-400 block"></span>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                <div className="p-2.5 bg-slate-950 border-t border-slate-800 text-center">
                  <span className="text-[11px] text-slate-500">
                    Logged in role: <strong className="text-sky-400">{currentRole}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Dropdown & Role Preview Switcher */}
          <div className="relative" ref={profileRef}>
            <button
              type="button"
              onClick={() => setIsProfileOpen((prev) => !prev)}
              aria-expanded={isProfileOpen}
              aria-label={`Profile menu for ${currentProfile.name}`}
              className="flex items-center gap-2 p-1 pl-2 pr-1.5 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 group"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                  {currentProfile.name}
                </div>
                <div className="text-[10px] text-sky-400 font-mono">
                  {currentRole} Role
                </div>
              </div>
              <img
                src={currentProfile.avatar}
                alt={currentProfile.name}
                className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-700"
              />
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform" />
            </button>

            {isProfileOpen && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-2 z-50 animate-fade-in"
              >
                {/* Profile Header */}
                <div className="p-3 border-b border-slate-800 flex items-center gap-3">
                  <img
                    src={currentProfile.avatar}
                    alt={currentProfile.name}
                    className="w-10 h-10 rounded-xl object-cover ring-2 ring-sky-500/40"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{currentProfile.name}</p>
                    <p className="text-[11px] text-slate-400 truncate">{currentProfile.email}</p>
                    <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                      {currentProfile.title}
                    </span>
                  </div>
                </div>

                {/* ROLE PREVIEW SWITCHER (Requirement 2: Role-based UI visibility toggle) */}
                <div className="p-2 my-1 bg-slate-950/70 rounded-xl border border-slate-800/80">
                  <div className="px-2 py-1 text-[10px] uppercase font-mono font-bold text-slate-400 flex items-center justify-between">
                    <span>Preview Role View</span>
                    <span className="text-sky-400 text-[9px] font-bold">Interactive</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 mt-1">
                    {Object.values(ROLES).map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => {
                          setCurrentRole(role);
                          setIsProfileOpen(false);
                        }}
                        className={`px-2 py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                          currentRole === role
                            ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Profile Action Links */}
                <div className="space-y-0.5 text-xs text-slate-300">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-left"
                  >
                    <User className="w-4 h-4 text-slate-400" />
                    <span>My Account & Identity</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-left"
                  >
                    <Shield className="w-4 h-4 text-slate-400" />
                    <span>Institutional Security & MFA</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-slate-800 hover:text-white transition-colors text-left"
                  >
                    <Settings className="w-4 h-4 text-slate-400" />
                    <span>Display Preferences</span>
                  </button>
                  <div className="border-t border-slate-800 my-1"></div>
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(false)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out of Portal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </header>
  );
};
