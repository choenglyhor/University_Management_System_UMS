import React, { useState } from 'react';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Users,
  FileSpreadsheet,
  CreditCard,
  Settings,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Server,
  Layers,
  Award,
  Sparkles,
  ShieldCheck,
  Calendar,
  Clock,
  ExternalLink
} from 'lucide-react';
import { useLayout, ROLES } from '../../context/LayoutContext';

/**
 * Enterprise University Management System (UMS) - Collapsible Navigation Sidebar
 * 
 * Features:
 * - Semantic HTML5 `<aside role="navigation">`
 * - Grouped navigation categories (Overview, Academics, Records & Finance, Administration)
 * - Accordion Sub-menus with smooth collapse/expand
 * - Active-state visual indicator with WCAG AA compliant contrast
 * - Role-Based filtering (Admin, Faculty, Student view adaptations)
 * - Responsive behavior:
 *    * Desktop (>= 1024px): Expands (260px) or Collapses into icon rail (72px)
 *    * Mobile (< 1024px): Sliding off-canvas drawer with backdrop overlay
 * - Persistent desktop collapse toggle button
 * - Keyboard navigation support (aria-expanded, aria-current)
 */
export const Sidebar = () => {
  const {
    currentRole,
    activeNavId,
    setActiveNavId,
    activeSubNavId,
    setActiveSubNavId,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    isDesktopCollapsed,
    toggleDesktopSidebar,
  } = useLayout();

  // Track expanded accordion sub-menus by item id
  const [expandedMenus, setExpandedMenus] = useState({
    'academic-programs': false,
    'gradebook': true,
    'course-registration': false,
    'student-records': false,
    'financial-ledger': false,
    'system-settings': false,
  });

  const toggleSubmenu = (id) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Enterprise navigation tree definition with role permissions & submenus
  const navGroups = [
    {
      groupTitle: 'Core Operations',
      items: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          icon: LayoutDashboard,
          badge: 'Live',
          badgeColor: 'emerald',
          roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT],
          subItems: [
            { id: 'dash-overview', label: 'Institutional Metrics' },
            { id: 'dash-activities', label: 'Recent Audit Logs' },
          ],
        },
      ],
    },
    {
      groupTitle: 'Academics & Curricula',
      items: [
        {
          id: 'academic-programs',
          title: 'Academic Programs',
          icon: BookOpen,
          roles: [ROLES.ADMIN, ROLES.FACULTY],
          subItems: [
            { id: 'prog-catalog', label: 'Degree Catalogs' },
            { id: 'prog-curriculum', label: 'Curriculum Mapping' },
            { id: 'prog-prereqs', label: 'Prerequisite Graph' },
          ],
        },
        {
          id: 'course-registration',
          title: 'Course Registration',
          icon: GraduationCap,
          roles: [ROLES.ADMIN, ROLES.STUDENT],
          subItems: [
            { id: 'reg-courses', label: 'Course Catalog & Enrollment' },
            { id: 'reg-waitlists', label: 'Waitlist Queues' },
            { id: 'reg-planner', label: 'Degree Roadmap Planner' },
          ],
        },
        {
          id: 'gradebook',
          title: 'Gradebook',
          icon: FileSpreadsheet,
          badge: 'MSSQL',
          badgeColor: 'sky',
          roles: [ROLES.ADMIN, ROLES.FACULTY],
          subItems: [
            { id: 'gb-matrix', label: 'Continuous Assessment Matrix' },
            { id: 'gb-verification', label: 'Grade Verification' },
            { id: 'gb-finalization', label: 'Final Transcript Publishing' },
          ],
        },
      ],
    },
    {
      groupTitle: 'Records & Finance',
      items: [
        {
          id: 'student-records',
          title: 'Student Records',
          icon: Users,
          roles: [ROLES.ADMIN, ROLES.FACULTY, ROLES.STUDENT],
          subItems: [
            { id: 'rec-portal', label: 'Academic Standing & GPA' },
            { id: 'rec-transcripts', label: 'Official Transcript Audit' },
            { id: 'rec-enrollment', label: 'Enrollment Verification' },
          ],
        },
        {
          id: 'financial-ledger',
          title: 'Financial Ledger',
          icon: CreditCard,
          roles: [ROLES.ADMIN, ROLES.STUDENT],
          subItems: [
            { id: 'fin-tuition', label: 'Tuition & Billing Statements' },
            { id: 'fin-scholarships', label: 'Scholarships & Aid Ledger' },
            { id: 'fin-history', label: 'Payment Receipts & Escrow' },
          ],
        },
      ],
    },
    {
      groupTitle: 'System & Governance',
      items: [
        {
          id: 'system-settings',
          title: 'System Settings',
          icon: Settings,
          roles: [ROLES.ADMIN],
          subItems: [
            { id: 'sys-db', label: 'MSSQL Connection & HA' },
            { id: 'sys-rbac', label: 'Role Permissions (RBAC)' },
            { id: 'sys-audit', label: 'Security & Transaction Logs' },
          ],
        },
      ],
    },
  ];

  // Filter groups and items strictly according to the active role
  const filteredNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => item.roles.includes(currentRole)),
    }))
    .filter((group) => group.items.length > 0);

  const handleItemClick = (item) => {
    setActiveNavId(item.id);
    if (item.subItems && item.subItems.length > 0) {
      toggleSubmenu(item.id);
      setActiveSubNavId(item.subItems[0].id);
    } else {
      setActiveSubNavId(null);
    }
    // Close mobile drawer upon navigation
    if (window.innerWidth < 1024) {
      setIsMobileSidebarOpen(false);
    }
  };

  const handleSubItemClick = (e, item, sub) => {
    e.stopPropagation();
    setActiveNavId(item.id);
    setActiveSubNavId(sub.id);
    if (window.innerWidth < 1024) {
      setIsMobileSidebarOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Sliding Drawer Backdrop Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Semantic Sidebar Shell */}
      <aside
        role="navigation"
        aria-label="Main Institutional Navigation"
        className={`fixed top-16 bottom-0 left-0 z-40 bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col justify-between
          ${
            /* Mobile drawer transform logic */
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }
          ${
            /* Desktop collapse width logic */
            isDesktopCollapsed ? 'w-20' : 'w-64'
          }
        `}
      >
        {/* Navigation Content Area */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin">
          
          {/* Active Role Quick Banner inside Sidebar */}
          {!isDesktopCollapsed && (
            <div className="px-3 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400"></span>
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  Role Scope:
                </span>
              </div>
              <span className="text-xs font-bold text-sky-400 px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/20 font-mono">
                {currentRole}
              </span>
            </div>
          )}

          {/* Grouped Navigation Links */}
          {filteredNavGroups.map((group, groupIdx) => (
            <div key={group.groupTitle} className="space-y-1.5">
              {/* Group Title (hidden when desktop sidebar is collapsed) */}
              {!isDesktopCollapsed ? (
                <div className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  {group.groupTitle}
                </div>
              ) : (
                <div className="h-2 border-b border-slate-800/80 mx-2" />
              )}

              {/* Items in this group */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeNavId === item.id;
                  const hasSubmenu = item.subItems && item.subItems.length > 0;
                  const isExpanded = expandedMenus[item.id];

                  return (
                    <div key={item.id} className="relative">
                      {/* Parent Link Button */}
                      <button
                        type="button"
                        onClick={() => handleItemClick(item)}
                        aria-current={isActive ? 'page' : undefined}
                        aria-expanded={hasSubmenu ? isExpanded : undefined}
                        title={isDesktopCollapsed ? item.title : undefined}
                        className={`w-full group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all relative ${
                          isActive
                            ? 'bg-sky-600/15 text-white border border-sky-500/30 shadow-sm'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                        }`}
                      >
                        {/* Active Left Glow Accent Bar */}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-sky-500 rounded-r-full shadow-lg shadow-sky-500/50" />
                        )}

                        <div className="flex items-center gap-3 min-w-0">
                          <Icon
                            className={`w-5 h-5 flex-shrink-0 transition-colors ${
                              isActive ? 'text-sky-400' : 'text-slate-400 group-hover:text-slate-200'
                            }`}
                          />
                          {!isDesktopCollapsed && (
                            <span className="truncate tracking-tight">{item.title}</span>
                          )}
                        </div>

                        {/* Right Pill & Submenu Chevron */}
                        {!isDesktopCollapsed && (
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            {item.badge && (
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                                  item.badgeColor === 'emerald'
                                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-sky-500/15 text-sky-400 border border-sky-500/30'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                            {hasSubmenu && (
                              <div
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleSubmenu(item.id);
                                }}
                                className="p-0.5 hover:text-white rounded"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </button>

                      {/* Sub-menu tree (collapses on desktop collapse mode) */}
                      {!isDesktopCollapsed && hasSubmenu && isExpanded && (
                        <div className="ml-5 pl-3 mt-1 space-y-1 border-l-2 border-slate-800/80 animate-fade-in">
                          {item.subItems.map((sub) => {
                            const isSubActive = isActive && activeSubNavId === sub.id;
                            return (
                              <button
                                key={sub.id}
                                type="button"
                                onClick={(e) => handleSubItemClick(e, item, sub)}
                                className={`w-full flex items-center justify-between text-left py-1.5 px-2.5 rounded-lg text-[11px] transition-all ${
                                  isSubActive
                                    ? 'bg-sky-500/20 text-sky-300 font-semibold border-l-2 border-sky-400'
                                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                                }`}
                              >
                                <span className="truncate">{sub.label}</span>
                                {isSubActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

        </div>

        {/* Sidebar Footer Area: System status & Desktop Collapse Toggle */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/70 space-y-2">
          {/* MSSQL Engine Status indicator (hidden when desktop collapsed) */}
          {!isDesktopCollapsed && (
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="truncate text-slate-300">MSSQL 2022</span>
              </div>
              <span className="text-[10px] text-emerald-400 font-bold">ONLINE</span>
            </div>
          )}

          {/* Desktop Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={toggleDesktopSidebar}
            aria-label={isDesktopCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-full hidden lg:flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-medium border border-transparent hover:border-slate-700 transition-all"
          >
            {isDesktopCollapsed ? (
              <ChevronRightIcon className="w-4 h-4 text-sky-400" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 text-slate-400" />
                <span className="font-mono text-[11px]">Collapse Rail</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
