import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Enterprise University Management System (UMS) / SIS
 * Layout, Auth & Theme Context
 * 
 * Manages:
 * - Authentication & User Session (Login, Logout, Active Credentials)
 * - Theme Engine (Dark / Light mode with localStorage & HTML class synchronization)
 * - Current active Role (Admin, Faculty, Student)
 * - Sidebar state (Mobile drawer open/close, Desktop collapsed/expanded)
 * - Navigation routing and active view selection
 * - Global Command Palette (Ctrl/Cmd + K) search modal
 * - Notification center & unread counter
 * - Academic term selector
 */

const LayoutContext = createContext(null);

export const ROLES = {
  ADMIN: 'Admin',
  FACULTY: 'Faculty',
  STUDENT: 'Student',
};

// PREDEFINED DEMO USER CREDENTIALS FOR INSTITUTIONAL ROLES
export const DEMO_USERS = [
  {
    id: 'usr-admin',
    username: 'admin',
    password: 'admin123',
    role: ROLES.ADMIN,
    name: 'Dr. Eleanor Vance',
    title: 'University Registrar & SysAdmin',
    email: 'admin@western.edu',
    dept: 'Office of Academic Affairs & Systems',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    unreadCount: 4,
  },
  {
    id: 'usr-faculty',
    username: 'faculty',
    password: 'faculty123',
    role: ROLES.FACULTY,
    name: 'Dr. Alan Turing',
    title: 'Professor of Computer Science',
    email: 'faculty@western.edu',
    dept: 'School of Computing & Data Science',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    unreadCount: 2,
  },
  {
    id: 'usr-student',
    username: 'student',
    password: 'student123',
    role: ROLES.STUDENT,
    name: 'Alice Smith',
    title: 'B.Sc. Computer Science (Junior)',
    email: 'student@western.edu',
    dept: 'Faculty of Engineering & Science',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    unreadCount: 1,
  },
];

export const LayoutProvider = ({ children }) => {
  // 1. Theme State (Dark / Light Mode)
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('ums_theme');
      if (saved) return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'dark';
    } catch {
      return 'dark';
    }
  });

  // Apply theme to document root element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
    try {
      localStorage.setItem('ums_theme', theme);
    } catch {
      // Ignore in restricted storage
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // 2. Authentication State (Login & Logout)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('ums_auth_user');
      if (savedUser) {
        return JSON.parse(savedUser);
      }
    } catch (e) {
      console.warn('Failed to parse cached user:', e);
    }
    // Default to admin user for instantaneous showcase, with ability to logout or switch
    return DEMO_USERS[0];
  });

  const isAuthenticated = Boolean(currentUser);
  const currentRole = currentUser?.role || ROLES.ADMIN;

  const login = (username, password) => {
    const cleanUser = username?.trim().toLowerCase();
    const foundUser = DEMO_USERS.find(
      (u) =>
        (u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser) &&
        u.password === password
    );

    if (foundUser) {
      setCurrentUser(foundUser);
      try {
        localStorage.setItem('ums_auth_user', JSON.stringify(foundUser));
      } catch (err) {
        console.warn('Failed to persist auth session:', err);
      }
      return { success: true, user: foundUser };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please use one of the demo accounts provided.',
    };
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('ums_auth_user');
    } catch (err) {
      console.warn('Failed to remove auth session:', err);
    }
  };

  // Fast switch role helper (e.g. For admin preview testing)
  const setCurrentRole = (newRole) => {
    const matchedDemoUser = DEMO_USERS.find((u) => u.role === newRole) || DEMO_USERS[0];
    setCurrentUser(matchedDemoUser);
    try {
      localStorage.setItem('ums_auth_user', JSON.stringify(matchedDemoUser));
    } catch (e) {
      console.warn(e);
    }
  };

  // 3. Responsive Sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);

  // 4. Navigation routing & breadcrumb state
  const [activeNavId, setActiveNavId] = useState('dashboard');
  const [activeSubNavId, setActiveSubNavId] = useState(null);

  // 5. Command Palette Search Modal state (Ctrl/Cmd + K)
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // 6. Academic Term state
  const [academicTerm, setAcademicTerm] = useState('Fall 2026');

  // 7. Notification Center state
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

  // Global shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close mobile sidebar on large screen resize
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

  const roleNotifications = notifications.filter(
    (n) => !n.forRoles || n.forRoles.includes(currentRole)
  );
  const unreadCount = roleNotifications.filter((n) => n.unread).length;

  return (
    <LayoutContext.Provider
      value={{
        // Theme Engine
        theme,
        toggleTheme,
        // Authentication & User Session
        currentUser,
        isAuthenticated,
        login,
        logout,
        demoUsers: DEMO_USERS,
        // Role state
        currentRole,
        setCurrentRole,
        currentProfile: currentUser || DEMO_USERS[0],
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
