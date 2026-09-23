import React from "react";
import {
  Building2,
  Users,
  BookOpen,
  GraduationCap,
  ArrowUpRight,
  Calendar,
} from "lucide-react";

const DashboardPage: React.FC = () => {
  const school = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "null").schoolAdmin
    : null;
  const dateFormatter = (date: string) => {
    if (!date) return "";
    const d = new Date(date);
    const monthName = d.toLocaleString("en-US", {
      month: "long",
    });
    return `${monthName} ${d.getFullYear()}`;
  };
  const stats = [
    {
      label: "Institution Status",
      value: school?.status === "ACTIVE" ? "Active" : school?.status === "PENDING" ? "Pending" : "Inactive",
      change: "Verified Institution",
      icon: Building2,
      trend: "100%",
      color: "bg-indigo-50 text-indigo-600 border-indigo-100",
    },
    {
      label: "Enrolled Students",
      value: "1,248",
      change: "+42 this term",
      icon: GraduationCap,
      trend: "+4%",
      color: "bg-violet-50 text-violet-600 border-violet-100",
    },
    {
      label: "Academic Staff",
      value: "86",
      change: "Active faculty",
      icon: Users,
      trend: "+2%",
      color: "bg-sky-50 text-sky-600 border-sky-100",
    },
    {
      label: "Active Courses",
      value: "34",
      change: "Full curriculum",
      icon: BookOpen,
      trend: "+5%",
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-50/90 via-white to-slate-50 border border-indigo-100/90 p-6 sm:p-7 shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100/70 text-indigo-700 border border-indigo-200/60">
              <Calendar size={13} className="text-indigo-600" />
              <span>Active From {dateFormatter(school?.createdAt)}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Welcome back,{" "}
              {school?.ownerName?.split(" ")[0] || "Administrator"} 
            </h2>
            
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {school?.status === "ACTIVE" && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <ArrowUpRight size={14} />
                <span>Active</span>
              </div>
            )}
            {school?.status === "PENDING" && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-50 text-yellow-700 border border-yellow-200/60">
                <ArrowUpRight size={14} />
                <span>Pending</span>
              </div>
            )}
            {school?.status === "INACTIVE" && (
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
                <ArrowUpRight size={14} />
                <span>Inactive</span>
              </div>
            )}
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
    </div>
  );
};

export default DashboardPage;
