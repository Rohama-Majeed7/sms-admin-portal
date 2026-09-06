import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, BookOpen, GraduationCap, ClipboardList,
  Settings, Bell, Menu, X, LogOut, Shield, Search,
  BarChart3, Calendar, MessageSquare, FileText, DollarSign, Building2, ChevronDown
} from 'lucide-react';
import { logout } from '../apis/auth/auth.service';

const navItems = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Schools', path: '/admin/schools', icon: Building2 },
  { label: 'Students', path: '/admin/students', icon: GraduationCap },
  { label: 'Teachers', path: '/admin/teachers', icon: Users },
  { label: 'Classes', path: '/admin/classes', icon: BookOpen },
  { label: 'Attendance', path: '/admin/attendance', icon: ClipboardList },
  { label: 'Timetable', path: '/admin/timetable', icon: Calendar },
  { label: 'Finance', path: '/admin/finance', icon: DollarSign },
  { label: 'Reports', path: '/admin/reports', icon: BarChart3 },
  { label: 'Messages', path: '/admin/messages', icon: MessageSquare, badge: 5 },
  { label: 'Documents', path: '/admin/documents', icon: FileText },
  { label: 'Settings', path: '/admin/settings', icon: Settings },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  pageTitle?: string;
  activePath?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, pageTitle = 'Admin Portal', activePath }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); } catch { return null; }
  })();

  const handleLogout = async () => {
    try {
      await logout(user.email)
    } catch { /* ignore API errors — already signed out locally */ }
    navigate('/login');
  };

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full bg-slate-900 border-r border-indigo-500/15">
      {/* Brand Header */}
      <div className={`flex items-center justify-between px-4 py-4 border-b border-indigo-500/15 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 flex-shrink-0">
            <Shield size={22} className="text-white" />
          </div>
          {(!collapsed || isMobile) && (
            <div>
              <p className="text-white font-bold text-base leading-tight">SMS Admin</p>
              <p className="text-indigo-400 text-xs font-medium">School Management</p>
            </div>
          )}
        </div>
        {isMobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation items */}
      <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-1">
        {navItems.map(({ label, path, icon: Icon, badge }) => {
          const currentPath = activePath || location.pathname;
          const active = currentPath === path;
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative text-sm font-medium
                ${active
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-md shadow-indigo-950/50'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
            >
              <Icon size={18} className={`flex-shrink-0 ${active ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
              {(!collapsed || isMobile) && <span className="truncate">{label}</span>}
              {(!collapsed || isMobile) && badge && (
                <span className="ml-auto bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {badge}
                </span>
              )}
              {collapsed && !isMobile && badge && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
              )}
              {collapsed && !isMobile && (
                <div className="absolute left-full ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-lg shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 border border-slate-700">
                  {label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile section inside sidebar */}
      <div className="p-3 border-t border-indigo-500/15">
        <div className={`flex items-center gap-3 p-2 rounded-xl bg-slate-800/50 border border-slate-700/40 ${collapsed && !isMobile ? 'justify-center' : ''}`}>
          <img
            src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'}
            alt="avatar"
            className="w-9 h-9 rounded-full border border-indigo-500/30 flex-shrink-0 object-cover"
          />
          {(!collapsed || isMobile) && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user?.name || 'Super Admin'}</p>
                <p className="text-slate-400 text-[11px] truncate">{user?.email || 'admin@school.edu'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex overflow-x-hidden">

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-[80vw] z-10 h-full">
            <SidebarContent isMobile={true} />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:flex flex-col transition-all duration-300 flex-shrink-0 ${collapsed ? 'w-20' : 'w-64'}`}>
        <SidebarContent isMobile={false} />
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Top Header Bar */}
        <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-indigo-500/15 px-4 lg:px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-3 min-w-0">
            {/* Toggle Button */}
            <button
              onClick={() => {
                if (window.innerWidth >= 1024) setCollapsed(!collapsed);
                else setMobileOpen(true);
              }}
              className="p-2 rounded-xl bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white hover:border-indigo-500/40 transition cursor-pointer flex-shrink-0"
              aria-label="Toggle Sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Header Title */}
            <div className="min-w-0">
              <h1 className="text-white font-bold text-base sm:text-lg truncate">{pageTitle}</h1>
              <p className="text-slate-400 text-xs hidden sm:block">School Management System</p>
            </div>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Search Input */}
            <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs">
              <Search size={15} className="text-slate-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search schools, staff..."
                className="bg-transparent text-slate-200 placeholder-slate-500 outline-none w-36 lg:w-48"
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-400 hover:text-white transition flex-shrink-0">
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 hover:border-indigo-500/40 transition cursor-pointer"
              >
                <img
                  src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin'}
                  alt="avatar"
                  className="w-7 h-7 rounded-full border border-indigo-500/30 object-cover"
                />
                <span className="text-xs font-semibold text-slate-200 hidden sm:inline truncate max-w-[100px]">
                  {user?.name?.split(' ')[0] || 'Admin'}
                </span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 py-1">
                  <div className="p-3 border-b border-slate-800">
                    <p className="text-sm font-semibold text-white truncate">{user?.name || 'Super Admin'}</p>
                    <p className="text-xs text-slate-400 truncate">{user?.email || 'admin@school.edu'}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-slate-800 transition cursor-pointer"
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
