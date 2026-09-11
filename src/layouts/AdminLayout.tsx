import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  Menu,
  X,
  LogOut,
  Shield,
  Search,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { logout } from '../apis/auth/auth.service';

const navItems = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'System overview & metrics',
  },
  {
    label: 'Schools',
    path: '/dashboard/schools',
    icon: Building2,
    description: 'Manage registered institutions',
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  activePath?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  pageTitle = 'Dashboard',
  activePath,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const location = useLocation();
  const navigate = useNavigate();

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      if (user?.email) {
        await logout(user.email);
      }
    } catch {
      /* ignore API errors, always clean up locally */
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      navigate('/login');
    }
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div
        className={`flex items-center h-16 px-4 border-b border-slate-100 ${
          collapsed && !isMobile ? 'justify-center' : 'justify-between'
        }`}
      >
        <Link
          to="/dashboard"
          className="flex items-center gap-3 group focus:outline-hidden"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-600/30 shrink-0 transition-transform group-hover:scale-[1.02]">
            <Shield size={20} strokeWidth={2.2} />
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-900 font-bold text-[15px] tracking-tight truncate">
                  SMS Admin
                </span>
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  PRO
                </span>
              </div>
              <p className="text-slate-400 text-xs font-medium truncate">
                School Management
              </p>
            </div>
          )}
        </Link>

        {isMobile && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Close Menu"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Links */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {(!collapsed || isMobile) && (
          <p className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Platform
          </p>
        )}

        <nav className="space-y-1">
          {navItems.map(({ label, path, icon: Icon, description }) => {
            const current = activePath || location.pathname;
            const active = current === path;

            return (
              <Link
                key={path}
                to={path}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                } ${collapsed && !isMobile ? 'justify-center px-2' : ''}`}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-indigo-600 rounded-r-full" />
                )}

                <Icon
                  size={19}
                  className={`shrink-0 transition-colors ${
                    active
                      ? 'text-indigo-600'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />

                {(!collapsed || isMobile) && (
                  <div className="flex-1 min-w-0">
                    <p className="leading-none truncate">{label}</p>
                    <p className="text-[11px] text-slate-400 font-normal truncate mt-1">
                      {description}
                    </p>
                  </div>
                )}

                {(!collapsed || isMobile) && active && (
                  <ChevronRight size={14} className="text-indigo-400 shrink-0" />
                )}

                {/* Collapsed Tooltip */}
                {collapsed && !isMobile && (
                  <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap">
                    {label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div
          className={`flex items-center gap-3 p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs ${
            collapsed && !isMobile ? 'justify-center p-1.5' : ''
          }`}
        >
          <img
            src={
              user?.avatar ||
              'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
            }
            alt="Admin avatar"
            className="w-8 h-8 rounded-lg bg-indigo-50 border border-slate-200 object-cover shrink-0"
          />

          {(!collapsed || isMobile) && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {user?.name || 'Administrator'}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {user?.email || 'admin@school.edu'}
                </p>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Sign Out"
                aria-label="Sign Out"
              >
                <LogOut size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Off-canvas Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white shadow-2xl transition-transform duration-200 ease-out lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent isMobile />
      </aside>

      {/* Desktop Sticky Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 transition-all duration-200 ease-out ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div
          className={`fixed inset-y-0 left-0 z-30 transition-all duration-200 ease-out ${
            collapsed ? 'w-20' : 'w-64'
          }`}
        >
          <SidebarContent />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Navigation */}
        <header className="sticky top-0 z-20 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Header Left: Toggle + Breadcrumb */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  setCollapsed(!collapsed);
                } else {
                  setMobileOpen(true);
                }
              }}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer shrink-0"
              aria-label="Toggle Sidebar"
            >
              <Menu size={18} />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
                <span>Portal</span>
                <ChevronRight size={12} />
                <span className="text-slate-600 font-semibold">{pageTitle}</span>
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate leading-tight">
                {pageTitle}
              </h1>
            </div>
          </div>

          {/* Header Right: Search, Notifications, User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search */}
            <div className="hidden md:flex items-center gap-2 bg-slate-100/80 hover:bg-slate-100 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/40 border border-slate-200/80 rounded-xl px-3 py-1.5 transition-all text-xs">
              <Search size={14} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="Search schools, records..."
                className="bg-transparent text-slate-800 placeholder-slate-400 outline-none w-40 lg:w-52 text-xs"
              />
              <kbd className="hidden lg:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded-md shadow-2xs">
                ⌘K
              </kbd>
            </div>

            {/* Notifications */}
            

            {/* User Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 sm:pr-2.5 rounded-xl border border-slate-200/80 hover:border-slate-300 bg-white shadow-xs hover:bg-slate-50 transition-all cursor-pointer"
                aria-expanded={profileOpen}
              >
                <img
                  src={
                    user?.avatar ||
                    'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'
                  }
                  alt="avatar"
                  className="w-7 h-7 rounded-lg bg-indigo-50 border border-slate-200 object-cover"
                />
                <span className="text-xs font-semibold text-slate-800 hidden sm:inline truncate max-w-[110px]">
                  {user?.name?.split(' ')[0] || 'Admin'}
                </span>
                <ChevronDown
                  size={13}
                  className={`text-slate-400 transition-transform ${
                    profileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden z-50">
                  <div className="p-3.5 border-b border-slate-100 bg-slate-50/50">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {user?.name || 'Super Admin'}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {user?.email || 'admin@school.edu'}
                    </p>
                    <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Active Administrator
                    </div>
                  </div>

                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut size={14} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
