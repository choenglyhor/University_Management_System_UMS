import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Enterprise University Management System (UMS) / SIS
 * Layout & Navigation Context
 * 
 * Manages:
 * - Current active preview Role (Admin, Faculty, Student)
 * - Sidebar state (Mobile drawer open/close, Desktop collapsed/expanded)
 * - Navigation selection and active route tracking
 * - Global Command Palette (Ctrl/Cmd + K) search modal state
 * - Notification center state with unread badge counter
 * - Academic term selector
 */

const LayoutContext = createContext(null);

export const ROLES = {
  ADMIN: 'Admin',
  FACULTY: 'Faculty',
  STUDENT: 'Student',
};

// Role profiles for realistic mock preview
export const ROLE_PROFILES = {
  [ROLES.ADMIN]: {
    name: 'Dr. Eleanor Vance',
    title: 'University Registrar & SysAdmin',
    email: 'e.vance@western.edu',
    dept: 'Office of Academic Affairs',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    unreadCount: 4,
  },
  [ROLES.FACULTY]: {
    name: 'Dr. Alan Turing',
    title: 'Professor of Computer Science',
    email: 'a.turing@western.edu',
    dept: 'School of Computing & Data Science',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    unreadCount: 2,
  },
  [ROLES.STUDENT]: {
    name: 'Alice Smith',
    title: 'B.Sc. Computer Science (Junior)',
    email: 'a.smith@student.western.edu',
    dept: 'Faculty of Engineering & Science',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    unreadCount: 1,
  },
};

export const LayoutProvider = ({ children }) => {
  // 1. Role-based state management
  const [currentRole, setCurrentRole] = useState(ROLES.ADMIN);

  // 2. Responsive Sidebar state
  // Mobile drawer (< 1024px): boolean open/close with overlay
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // Desktop sidebar (>= 1024px): collapsed icon-only vs full width
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // 3. Navigation routing & breadcrumb state
  const [activeNavId, setActiveNavId] = useState('dashboard');
  const [activeSubNavId, setActiveSubNavId] = useState(null);

  // 4. Command Palette Search Modal state (Ctrl/Cmd + K)
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 5. Academic Term state
  const [academicTerm, setAcademicTerm] = useState('Fall 2026');

  // 6. Notification Center state
  const [notifications, setNotifications] = useState([
    {
      id: 'notif-1',
      title: 'Grade Submission Deadline Approaching',
      description: 'Midterm assessment lock will engage on Friday at 23:59 EST.',
      timestamp: '15m ago',
      unread: true,
      category: 'academic',
      forRoles: [ROLES.ADMIN, ROLES.FACULTY],
    },
    {
      id: 'notif-2',
      title: 'Waitlist Seat Released: SE301',
      description: 'Student Alice Smith moved from waitlist #1 to enrolled roster.',
      timestamp: '1h ago',
      unread: true,
      category: 'registration',
      forRoles: [ROLES.ADMIN, ROLES.STUDENT],
    },
    {
      id: 'notif-3',
      title: 'Tuition Payment Confirmed',
      description: 'Term tuition installment for Fall 2026 received and processed.',
      timestamp: '3h ago',
      unread: true,
      category: 'finance',
      forRoles: [ROLES.ADMIN, ROLES.STUDENT],
    },
    {
      id: 'notif-4',
      title: 'MSSQL High Availability Sync Complete',
      description: 'Nightly catalog synchronization verified with zero index divergence.',
      timestamp: '5h ago',
      unread: false,
      category: 'system',
      forRoles: [ROLES.ADMIN],
    },
  ]);

  // Handle global keyboard shortcut: Ctrl+K or Cmd+K to open Command Palette
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      // Close on Escape key
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile sidebar on window resize if viewport becomes large
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev);
  const toggleDesktopSidebar = () => setIsDesktopCollapsed((prev) => !prev);

  const markNotificationRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  const currentProfile = ROLE_PROFILES[currentRole] || ROLE_PROFILES[ROLES.ADMIN];

  // Filter notifications relevant to current active role
  const roleNotifications = notifications.filter(
    (n) => !n.forRoles || n.forRoles.includes(currentRole)
  );
  const unreadCount = roleNotifications.filter((n) => n.unread).length;

  return (
    <LayoutContext.Provider
      value={{
        // Role state
        currentRole,
        setCurrentRole,
        currentProfile,
        // Sidebar states
        isMobileSidebarOpen,
        setIsMobileSidebarOpen,
        toggleMobileSidebar,
        isDesktopCollapsed,
        setIsDesktopCollapsed,
        toggleDesktopSidebar,
        // Navigation & Route states
        activeNavId,
        setActiveNavId,
        activeSubNavId,
        setActiveSubNavId,
        // Search & Palette
        isSearchOpen,
        setIsSearchOpen,
        // Academic Term
        academicTerm,
        setAcademicTerm,
        // Notifications
        notifications: roleNotifications,
        unreadCount,
        markNotificationRead,
        markAllNotificationsRead,
      }}
    >
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
};
