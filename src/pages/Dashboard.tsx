import React from 'react';
import AdminLayout from '../layouts/AdminLayout';
import {
  School, Users, TrendingUp, BookOpen, GraduationCap,
  ArrowUpRight, MoreHorizontal, CheckCircle2, Clock, AlertCircle
} from 'lucide-react';

const stats = [
  {
    label: 'Total Schools',
    value: '24',
    change: '+2 this month',
    color: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/20',
    icon: <School size={22} />,
    trend: '+8%',
  },
  {
    label: 'Total Students',
    value: '12,480',
    change: '+340 enrolled',
    color: 'bg-violet-500/15 text-violet-400 border-violet-500/20',
    icon: <GraduationCap size={22} />,
    trend: '+3%',
  },
  {
    label: 'Staff Members',
    value: '1,056',
    change: '+12 this month',
    color: 'bg-sky-500/15 text-sky-400 border-sky-500/20',
    icon: <Users size={22} />,
    trend: '+1%',
  },
  {
    label: 'Active Courses',
    value: '384',
    change: '18 new subjects',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
    icon: <BookOpen size={22} />,
    trend: '+5%',
  },
];

const recentSchools = [
  { name: 'Greenwood Academy',     location: 'Nairobi', students: 520, status: 'Active',   added: '2 days ago' },
  { name: 'Sunrise High School',   location: 'Mombasa', students: 398, status: 'Active',   added: '5 days ago' },
  { name: 'Valley Primary',        location: 'Kisumu',  students: 210, status: 'Pending',  added: '1 week ago' },
  { name: 'Hilltop International', location: 'Nakuru',  students: 640, status: 'Active',   added: '2 weeks ago' },
  { name: 'Lakeview Academy',      location: 'Eldoret', students: 315, status: 'Inactive', added: '1 month ago' },
];

const recentActivities = [
  { icon: <CheckCircle2 size={16} />, color: 'text-emerald-400', text: 'Greenwood Academy registration approved', time: '10 min ago' },
  { icon: <AlertCircle size={16} />,  color: 'text-yellow-400',  text: 'Valley Primary pending verification',    time: '1 hour ago' },
  { icon: <CheckCircle2 size={16} />, color: 'text-emerald-400', text: '12 new staff accounts created',          time: '3 hours ago' },
  { icon: <Clock size={16} />,        color: 'text-indigo-400',  text: 'Monthly report generation scheduled',    time: '1 day ago' },
];

const Dashboard: React.FC = () => {
  return (
    <AdminLayout pageTitle="Dashboard" activePath="/dashboard">
      <div className="space-y-6">

        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900/60 via-indigo-800/40 to-slate-900 border border-indigo-500/30 p-6 sm:p-8">
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-white font-bold text-xl sm:text-2xl mb-1">Good morning, Admin 👋</h2>
              <p className="text-slate-300 text-sm max-w-xl">
                Here's what's happening across all registered schools and educational institutions today.
              </p>
            </div>
            <button className="self-start sm:self-auto bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition cursor-pointer flex items-center gap-2">
              <School size={16} /> Register New School
            </button>
          </div>
        </div>

        {/* Responsive Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/30 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${s.color}`}>
                  {s.icon}
                </div>
                <div className="flex items-center gap-1 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                  <ArrowUpRight size={14} />{s.trend}
                </div>
              </div>
              <p className="text-slate-400 text-xs font-medium">{s.label}</p>
              <p className="text-white font-bold text-2xl mt-0.5">{s.value}</p>
              <p className="text-slate-500 text-xs mt-1">{s.change}</p>
            </div>
          ))}
        </div>

        {/* Responsive Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Schools Table Card */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-white font-bold text-base sm:text-lg">Registered Schools</h3>
                <p className="text-slate-400 text-xs">Latest institutions enrolled in the platform</p>
              </div>
              <button className="self-start sm:self-auto text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition">
                View All Schools &rarr;
              </button>
            </div>

            {/* Scrollable Table Wrapper */}
            <div className="overflow-x-auto -mx-5 sm:mx-0">
              <table className="w-full text-left border-collapse min-w-[550px]">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">School Name</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">Students</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {recentSchools.map((s) => (
                    <tr key={s.name} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                            <School size={15} className="text-indigo-400" />
                          </div>
                          <span className="font-semibold text-white truncate max-w-[160px]">{s.name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-300 text-xs">{s.location}</td>
                      <td className="py-3.5 px-4 text-slate-300 text-xs font-medium">{s.students.toLocaleString()}</td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          s.status === 'Active'   ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          s.status === 'Pending'  ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                          'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition">
                          <MoreHorizontal size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity Feed & System Health Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-6">
            <div>
              <h3 className="text-white font-bold text-base sm:text-lg mb-1">Recent Activity</h3>
              <p className="text-slate-400 text-xs mb-5">System-wide operational events</p>
              <div className="space-y-4">
                {recentActivities.map((a, i) => (
                  <div key={i} className="flex gap-3">
                    <div className={`mt-0.5 flex-shrink-0 ${a.color}`}>{a.icon}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-200 text-xs sm:text-sm leading-snug">{a.text}</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* System Health Widget */}
            <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <div className="flex items-center justify-between mb-2">
                <p className="text-indigo-300 text-xs font-semibold">System Operational Status</p>
                <span className="text-emerald-400 text-xs font-bold">99.9% Uptime</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full" style={{ width: '98%' }} />
              </div>
              <p className="text-slate-400 text-[11px] mt-2">All school databases & servers fully operational.</p>
            </div>
          </div>
        </div>

      </div>
    </AdminLayout>
  );
};

export default Dashboard;
