import React from 'react';
import {
  Users, GraduationCap, BookOpen, DollarSign,
  TrendingUp, TrendingDown, AlertCircle, CheckCircle2,
  Clock, BarChart3, Activity
} from 'lucide-react';

const stats = [
  { title: 'Total Students', value: '2,847', change: '+12%', trend: 'up', icon: GraduationCap, color: 'from-indigo-500 to-indigo-600' },
  { title: 'Total Teachers', value: '124', change: '+3%', trend: 'up', icon: Users, color: 'from-emerald-500 to-emerald-600' },
  { title: 'Active Classes', value: '48', change: '0%', trend: 'neutral', icon: BookOpen, color: 'from-violet-500 to-violet-600' },
  { title: 'Fee Collected', value: '$84,200', change: '+8%', trend: 'up', icon: DollarSign, color: 'from-amber-500 to-orange-500' },
];

const recentActivities = [
  { type: 'success', msg: 'New student Emma Johnson enrolled in Grade 10-A', time: '5 min ago' },
  { type: 'warning', msg: 'Fee payment overdue for 12 students in Grade 9', time: '1 hr ago' },
  { type: 'info', msg: 'Parent-teacher meeting scheduled for March 20', time: '2 hr ago' },
  { type: 'success', msg: 'Mr. Carter submitted Grade 10 results', time: '3 hr ago' },
  { type: 'warning', msg: 'Attendance rate dropped below 80% in Class 7-B', time: '5 hr ago' },
];

const topClasses = [
  { name: 'Grade 12-A', performance: 88 },
  { name: 'Grade 10-A', performance: 85 },
  { name: 'Grade 11-B', performance: 82 },
  { name: 'Grade 9-C', performance: 79 },
  { name: 'Grade 8-A', performance: 76 },
];

const AdminDashboard: React.FC = () => (
  <div className="space-y-6">
    <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white" />
        <div className="absolute -bottom-10 right-20 w-32 h-32 rounded-full bg-white" />
      </div>
      <div className="relative">
        <p className="text-indigo-200 text-sm font-medium">Good morning,</p>
        <h2 className="text-2xl font-bold mt-0.5" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Dr. Sarah Mitchell 👋</h2>
        <p className="text-indigo-200 text-sm mt-1">Here's what's happening at your school today.</p>
        <div className="flex gap-4 mt-4">
          <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
            <p className="text-indigo-200 text-xs">Academic Year</p>
            <p className="text-white font-bold text-sm">2025 – 2026</p>
          </div>
          <div className="bg-white/10 rounded-xl px-4 py-2 backdrop-blur-sm">
            <p className="text-indigo-200 text-xs">Current Term</p>
            <p className="text-white font-bold text-sm">Term 2</p>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map(({ title, value, change, trend, icon: Icon, color }) => (
        <div key={title} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
              <Icon size={20} className="text-white" />
            </div>
            <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full
              ${trend === 'up' ? 'text-emerald-700 bg-emerald-50' : trend === 'down' ? 'text-red-700 bg-red-50' : 'text-slate-600 bg-slate-100'}`}>
              {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : null}
              {change}
            </span>
          </div>
          <p className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>{value}</p>
          <p className="text-slate-500 text-xs mt-0.5">{title}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Recent Activity</h3>
          <span className="text-xs text-indigo-600 font-medium cursor-pointer hover:text-indigo-700">View all</span>
        </div>
        <div className="space-y-3">
          {recentActivities.map(({ type, msg, time }, i) => (
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5
                ${type === 'success' ? 'bg-emerald-100' : type === 'warning' ? 'bg-amber-100' : 'bg-blue-100'}`}>
                {type === 'success' ? <CheckCircle2 size={14} className="text-emerald-600" /> :
                  type === 'warning' ? <AlertCircle size={14} className="text-amber-600" /> :
                    <Activity size={14} className="text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-700 leading-snug">{msg}</p>
                <div className="flex items-center gap-1 mt-1">
                  <Clock size={10} className="text-slate-400" />
                  <span className="text-xs text-slate-400">{time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 size={16} className="text-indigo-500" />
          <h3 className="font-bold text-slate-800" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>Top Classes</h3>
        </div>
        <div className="space-y-4">
          {topClasses.map(({ name, performance }) => (
            <div key={name}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-700">{name}</span>
                <span className="text-xs font-bold text-indigo-600">{performance}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-1.5 rounded-full"
                  style={{ width: `${performance}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
