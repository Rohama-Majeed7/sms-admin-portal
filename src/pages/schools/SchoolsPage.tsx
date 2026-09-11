import React, { useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  MoreHorizontal,
  MapPin,
  CheckCircle2,
  Clock,
  XCircle,
  X,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface SchoolItem {
  id: number;
  name: string;
  location: string;
  students: number;
  staff: number;
  courses: number;
  status: 'Active' | 'Pending' | 'Inactive';
  joined: string;
}

const initialSchools: SchoolItem[] = [
  { id: 1, name: 'Greenwood Academy', location: 'Nairobi', students: 520, staff: 42, courses: 28, status: 'Active', joined: 'Jan 2024' },
  { id: 2, name: 'Sunrise High School', location: 'Mombasa', students: 398, staff: 35, courses: 22, status: 'Active', joined: 'Mar 2024' },
  { id: 3, name: 'Valley Primary', location: 'Kisumu', students: 210, staff: 18, courses: 14, status: 'Pending', joined: 'Jun 2024' },
  { id: 4, name: 'Hilltop International', location: 'Nakuru', students: 640, staff: 58, courses: 34, status: 'Active', joined: 'Aug 2023' },
  { id: 5, name: 'Lakeview Academy', location: 'Eldoret', students: 315, staff: 28, courses: 20, status: 'Inactive', joined: 'Feb 2023' },
  { id: 6, name: 'Riverside School', location: 'Thika', students: 280, staff: 24, courses: 18, status: 'Active', joined: 'Oct 2024' },
  { id: 7, name: 'Palm Grove Institute', location: 'Malindi', students: 190, staff: 16, courses: 12, status: 'Pending', joined: 'Nov 2024' },
];

const statusBadge = (status: 'Active' | 'Pending' | 'Inactive') => {
  if (status === 'Active') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80">
        <CheckCircle2 size={12} className="text-emerald-500" />
        Active
      </span>
    );
  }
  if (status === 'Pending') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200/80">
        <Clock size={12} className="text-amber-500" />
        Pending
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
      <XCircle size={12} className="text-slate-400" />
      Inactive
    </span>
  );
};

const SchoolsPage: React.FC = () => {
  const [schoolsList, setSchoolsList] = useState<SchoolItem[]>(initialSchools);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Pending' | 'Inactive'>('All');
  const [sortKey, setSortKey] = useState<'name' | 'students' | 'staff'>('name');

  // Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState<SchoolItem | null>(null);

  // New School Form State
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    students: '',
    staff: '',
    courses: '',
    status: 'Active' as 'Active' | 'Pending' | 'Inactive',
  });
  const [formError, setFormError] = useState('');

  // Dropdown menu state
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  // Filter and Sort
  const filteredSchools = schoolsList
    .filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.location.toLowerCase().includes(search.toLowerCase());
      const matchFilter = filter === 'All' || s.status === filter;
      return matchSearch && matchFilter;
    })
    .sort((a, b) => {
      if (sortKey === 'students') return b.students - a.students;
      if (sortKey === 'staff') return b.staff - a.staff;
      return a.name.localeCompare(b.name);
    });

  // KPI Metrics
  const metrics = [
    {
      label: 'Total Schools',
      value: schoolsList.length,
      icon: Building2,
      color: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    },
    {
      label: 'Active Institutions',
      value: schoolsList.filter((s) => s.status === 'Active').length,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    },
    {
      label: 'Pending Approval',
      value: schoolsList.filter((s) => s.status === 'Pending').length,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 border-amber-100',
    },
    {
      label: 'Inactive / Suspended',
      value: schoolsList.filter((s) => s.status === 'Inactive').length,
      icon: XCircle,
      color: 'bg-slate-100 text-slate-600 border-slate-200',
    },
  ];

  const handleAddSchoolSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.location.trim()) {
      setFormError('Please provide both school name and location.');
      return;
    }

    const newSchool: SchoolItem = {
      id: Date.now(),
      name: formData.name.trim(),
      location: formData.location.trim(),
      students: parseInt(formData.students, 10) || 0,
      staff: parseInt(formData.staff, 10) || 0,
      courses: parseInt(formData.courses, 10) || 0,
      status: formData.status,
      joined: 'Just now',
    };

    setSchoolsList([newSchool, ...schoolsList]);
    setFormData({
      name: '',
      location: '',
      students: '',
      staff: '',
      courses: '',
      status: 'Active',
    });
    setIsAddModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (deleteCandidate) {
      setSchoolsList(schoolsList.filter((s) => s.id !== deleteCandidate.id));
      setDeleteCandidate(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Schools Management
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            View, search, and manage registered educational institutions across the system.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all hover:shadow-md cursor-pointer"
        >
          <Plus size={16} strokeWidth={2.4} />
          <span>Add New School</span>
        </button>
      </section>

      {/* KPI Metrics */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.label}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500 truncate">
                  {m.label}
                </span>
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border shrink-0 ${m.color}`}
                >
                  <Icon size={14} />
                </div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {m.value}
              </p>
            </div>
          );
        })}
      </section>

      {/* Search & Filter Toolbar */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search by school name or city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md cursor-pointer"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Status Filter Tabs & Sort Dropdown */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
            {(['All', 'Active', 'Pending', 'Inactive'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === f
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 shrink-0">
            <span>Sort:</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
              className="bg-transparent text-slate-800 font-medium outline-none cursor-pointer"
            >
              <option value="name">Name</option>
              <option value="students">Students</option>
              <option value="staff">Staff</option>
            </select>
          </div>
        </div>
      </section>

      {/* Schools Table / Cards */}
      <section className="bg-white border border-slate-200/90 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800 font-semibold">{filteredSchools.length}</strong> institutions
          </span>
          {filter !== 'All' || search ? (
            <button
              onClick={() => {
                setFilter('All');
                setSearch('');
              }}
              className="text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
            >
              Reset filters
            </button>
          ) : null}
        </div>

        {/* Desktop View Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">School Name</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Students</th>
                <th className="py-3 px-4">Staff</th>
                <th className="py-3 px-4">Courses</th>
                <th className="py-3 px-4">Joined</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 text-sm">
                    <Building2 size={32} className="mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-700">No schools found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try adjusting your search keywords or active filters.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredSchools.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                          <Building2 size={16} />
                        </div>
                        <span className="font-semibold text-slate-900 text-sm truncate max-w-[200px]">
                          {s.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-slate-600">
                      <div className="inline-flex items-center gap-1.5">
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span>{s.location}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-800">
                      {s.students.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                      {s.staff}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600 font-medium">
                      {s.courses}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {s.joined}
                    </td>
                    <td className="py-3.5 px-4">
                      {statusBadge(s.status)}
                    </td>
                    <td className="py-3.5 px-5 text-right relative">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenDropdownId(openDropdownId === s.id ? null : s.id)
                        }
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="Actions"
                      >
                        <MoreHorizontal size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {openDropdownId === s.id && (
                        <div className="absolute right-5 top-10 w-40 bg-white border border-slate-200 rounded-xl shadow-lg z-30 py-1 text-xs text-left animate-in fade-in zoom-in-95 duration-75">
                          <button
                            onClick={() => {
                              setOpenDropdownId(null);
                              alert(`Viewing institutional records for ${s.name}`);
                            }}
                            className="w-full px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                          >
                            <ExternalLink size={13} /> View Details
                          </button>
                          <button
                            onClick={() => {
                              setOpenDropdownId(null);
                              setDeleteCandidate(s);
                            }}
                            className="w-full px-3 py-2 text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                          >
                            <Trash2 size={13} /> Remove School
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View Cards (under md breakpoint) */}
        <div className="md:hidden divide-y divide-slate-100">
          {filteredSchools.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Building2 size={32} className="mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No schools found</p>
            </div>
          ) : (
            filteredSchools.map((s) => (
              <div key={s.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{s.name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin size={11} /> {s.location} • Joined {s.joined}
                      </p>
                    </div>
                  </div>
                  {statusBadge(s.status)}
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-2.5 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Students</span>
                    <span className="font-bold text-slate-800">{s.students.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Staff</span>
                    <span className="font-bold text-slate-800">{s.staff}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold block">Courses</span>
                    <span className="font-bold text-slate-800">{s.courses}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => setDeleteCandidate(s)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Add School Modal Dialog */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New School</h3>
                <p className="text-xs text-slate-500">Register an educational institution into the portal</p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddSchoolSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  School Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Jude International Academy"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Location / City *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nairobi"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Students</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="500"
                    value={formData.students}
                    onChange={(e) => setFormData({ ...formData, students: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Staff</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="35"
                    value={formData.staff}
                    onChange={(e) => setFormData({ ...formData, staff: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700">Courses</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="20"
                    value={formData.courses}
                    onChange={(e) => setFormData({ ...formData, courses: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Initial Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending Approval</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-xs shadow-indigo-600/30 cursor-pointer"
                >
                  Save Institution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
              <Trash2 size={24} />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Remove Institution?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete <strong className="text-slate-800">{deleteCandidate.name}</strong>? This action will remove its data from the portal.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs shadow-rose-600/30 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolsPage;
