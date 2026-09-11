import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  BookOpen,
  GraduationCap,
  ArrowUpRight,
  MoreHorizontal,
  CheckCircle2,
  Clock,
  AlertCircle,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

const stats = [
  {
    label: 'Total Schools',
    value: '24',
    change: '+2 this month',
    icon: Building2,
    trend: '+8%',
    color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  },
  {
    label: 'Total Students',
    value: '12,480',
    change: '+340 enrolled',
    icon: GraduationCap,
    trend: '+3%',
    color: 'bg-violet-50 text-violet-600 border-violet-100',
  },
  {
    label: 'Staff Members',
    value: '1,056',
    change: '+12 this month',
    icon: Users,
    trend: '+1%',
    color: 'bg-sky-50 text-sky-600 border-sky-100',
  },
  {
    label: 'Active Courses',
    value: '384',
    change: '18 new subjects',
    icon: BookOpen,
    trend: '+5%',
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  },
];

const recentSchools = [
  { name: 'Greenwood Academy', location: 'Nairobi', students: 520, status: 'Active', added: '2 days ago' },
  { name: 'Sunrise High School', location: 'Mombasa', students: 398, status: 'Active', added: '5 days ago' },
  { name: 'Valley Primary', location: 'Kisumu', students: 210, status: 'Pending', added: '1 week ago' },
  { name: 'Hilltop International', location: 'Nakuru', students: 640, status: 'Active', added: '2 weeks ago' },
  { name: 'Lakeview Academy', location: 'Eldoret', students: 315, status: 'Inactive', added: '1 month ago' },
];

const recentActivities = [
  {
    Icon: CheckCircle2,
    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    text: 'Greenwood Academy registration verified & approved',
    time: '10 min ago',
  },
  {
    Icon: AlertCircle,
    iconColor: 'text-amber-600 bg-amber-50 border-amber-100',
    text: 'Valley Primary pending institutional verification',
    time: '1 hour ago',
  },
  {
    Icon: CheckCircle2,
    iconColor: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    text: '12 new staff accounts provisioned across institutions',
    time: '3 hours ago',
  },
  {
    Icon: Clock,
    iconColor: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    text: 'Monthly institutional audit generation scheduled',
    time: '1 day ago',
  },
];

const statusBadge = (status: string) => {
  if (status === 'Active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Active
      </span>
    );
  }
  if (status === 'Pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
      Inactive
    </span>
  );
};

const DashboardPage: React.FC = () => {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  const adminName = user?.name?.split(' ')[0] || 'Administrator';

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-50/90 via-white to-slate-50 border border-indigo-100/90 p-6 sm:p-7 shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100/70 text-indigo-700 border border-indigo-200/60">
              <Calendar size={13} className="text-indigo-600" />
              <span>Academic Year 2025–2026 • Term 2</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back, {adminName} 👋
            </h2>
            <p className="text-sm text-slate-500 max-w-xl">
              Here is a summary of all registered educational institutions, enrollments, and system activities today.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/dashboard/schools"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all hover:shadow-md cursor-pointer"
            >
              <Building2 size={16} />
              <span>Manage Schools</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* KPI Stats Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {stats.map(({ label, value, change, icon: Icon, trend, color }) => (
          <div
            key={label}
            className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-slate-300/90 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <div
                className={`w-11 h-11 rounded-xl flex items-center justify-center border shadow-2xs transition-transform group-hover:scale-105 ${color}`}
              >
                <Icon size={20} strokeWidth={2.1} />
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <ArrowUpRight size={13} />
                {trend}
              </span>
            </div>

            <p className="text-xs font-medium text-slate-500">{label}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-0.5">
              {value}
            </p>
            <p className="text-xs text-slate-400 mt-1">{change}</p>
          </div>
        ))}
      </section>

      {/* Main Grid Layout: Table (2/3) + Activities & System Status (1/3) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Registered Schools Preview */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden flex flex-col">
          {/* Card Header */}
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                Registered Schools
              </h3>
              <p className="text-xs text-slate-500">
                Recent educational institutions on the platform
              </p>
            </div>
            <Link
              to="/dashboard/schools"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
            >
              <span>View all schools</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Desktop Table View */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">School Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Students</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {recentSchools.map((s) => (
                  <tr
                    key={s.name}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                          <Building2 size={16} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-slate-900 text-sm block truncate max-w-[180px]">
                            {s.name}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Added {s.added}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 text-xs font-medium">
                      <div className="inline-flex items-center gap-1.5">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span>{s.location}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-800 text-xs font-semibold">
                      {s.students.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4">
                      {statusBadge(s.status)}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <Link
                        to="/dashboard/schools"
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors inline-flex"
                        title="View school"
                      >
                        <MoreHorizontal size={16} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List (under sm breakpoint) */}
          <div className="sm:hidden divide-y divide-slate-100">
            {recentSchools.map((s) => (
              <div key={s.name} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <Building2 size={16} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{s.name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {s.location}
                      </p>
                    </div>
                  </div>
                  {statusBadge(s.status)}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                  <span>{s.students.toLocaleString()} Students enrolled</span>
                  <span>Added {s.added}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Activities + Operational Health */}
        <div className="space-y-6 flex flex-col justify-between">
          {/* Recent Activity Card */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 shadow-xs flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                  Recent Activities
                </h3>
                <p className="text-xs text-slate-500">
                  Key platform events
                </p>
              </div>
              <span className="p-1 rounded-lg bg-indigo-50 text-indigo-600">
                <Sparkles size={16} />
              </span>
            </div>

            <div className="space-y-4">
              {recentActivities.map((a, i) => {
                const IconComponent = a.Icon;
                return (
                  <div key={i} className="flex items-start gap-3">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 mt-0.5 ${a.iconColor}`}
                    >
                      <IconComponent size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-700 leading-snug font-medium">
                        {a.text}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{a.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* System Health Widget */}
          <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs border border-slate-800">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" />
                <span className="text-xs font-semibold text-slate-200">
                  System Health
                </span>
              </div>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                99.9% Uptime
              </span>
            </div>

            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden mb-2">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: '99%' }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span>Database & Services Operational</span>
              <span className="text-emerald-400 font-medium">Healthy</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
