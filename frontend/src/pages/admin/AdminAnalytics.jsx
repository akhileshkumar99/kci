import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Users, TrendingUp, Activity, Award, FileText, Download,
  RefreshCw, Building2, Calendar, LogIn, ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, LineChart, Line, Legend,
} from 'recharts';
import api from '../../utils/api';

const COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

function StatCard({ label, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
        </div>
      </div>
      <p className="text-xl sm:text-2xl font-bold text-gray-900">{value ?? 0}</p>
      <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">{sub}</p>}
    </div>
  );
}

function exportCSV(data, filename) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const rows = [keys.join(','), ...data.map(r => keys.map(k => {
    const v = r[k];
    if (typeof v === 'object' && v !== null) return JSON.stringify(v).replace(/,/g, ';');
    return String(v ?? '').replace(/,/g, ' ');
  }).join(','))];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = filename; a.click();
}

function BranchRow({ b, idx, onSelect }) {
  const [open, setOpen] = useState(false);
  const pct = b.students.total > 0 ? Math.round((b.students.approved / b.students.total) * 100) : 0;
  return (
    <>
      <tr className={`border-b border-gray-50 hover:bg-blue-50/40 transition-colors cursor-pointer ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
        <td className="px-4 py-3" onClick={() => onSelect(b._id)}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">{b.branchName}</p>
              <p className="text-xs text-gray-400">{b.branchCode} · {b.branchCity}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-center" onClick={() => onSelect(b._id)}>
          <span className="font-bold text-gray-900">{b.students.total}</span>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <span className="text-[10px] text-gray-400">{pct}% approved</span>
        </td>
        <td className="px-4 py-3 text-center text-sm font-medium text-green-600" onClick={() => onSelect(b._id)}>{b.students.today}</td>
        <td className="px-4 py-3 text-center text-sm font-medium text-blue-600" onClick={() => onSelect(b._id)}>{b.students.week}</td>
        <td className="px-4 py-3 text-center text-sm font-medium text-violet-600" onClick={() => onSelect(b._id)}>{b.students.month}</td>
        <td className="px-4 py-3 text-center text-sm font-medium text-orange-600" onClick={() => onSelect(b._id)}>{b.students.year}</td>
        <td className="px-4 py-3 text-center" onClick={() => onSelect(b._id)}>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${b.loginActivity > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            <LogIn className="w-3 h-3" /> {b.loginActivity}
          </span>
        </td>
        <td className="px-4 py-3 text-center text-sm" onClick={() => onSelect(b._id)}>{b.admissions.total}</td>
        <td className="px-4 py-3 text-center text-sm" onClick={() => onSelect(b._id)}>{b.results}</td>
        <td className="px-4 py-3 text-center text-sm" onClick={() => onSelect(b._id)}>{b.certificates}</td>
        <td className="px-4 py-3 text-center">
          <button onClick={e => { e.stopPropagation(); setOpen(!open); }} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
            {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
          </button>
        </td>
      </tr>
      {open && b.monthlyStudents?.length > 0 && (
        <tr>
          <td colSpan={11} className="px-4 py-3 bg-blue-50/40">
            <p className="text-xs font-semibold text-gray-600 mb-2">Monthly Student Registrations — {b.branchName}</p>
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={b.monthlyStudents} barSize={20}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', fontSize: 11 }} />
                <Bar dataKey="count" name="Students" radius={[4, 4, 0, 0]} fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </td>
        </tr>
      )}
    </>
  );
}

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('students');
  const [selectedBranch, setSelectedBranch] = useState('all');

  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data: res } = await api.get('/admin/analytics');
      setData(res);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const allBranches = data?.branchPerformance || [];

  const filtered = allBranches
    .filter(b => {
      if (selectedBranch !== 'all') return b._id === selectedBranch;
      const q = search.toLowerCase();
      return !q || (b.branchName || '').toLowerCase().includes(q) || (b.branchCity || '').toLowerCase().includes(q) || (b.branchCode || '').toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (selectedBranch !== 'all') return 0;
      if (sortBy === 'students') return b.students.total - a.students.total;
      if (sortBy === 'month') return b.students.month - a.students.month;
      if (sortBy === 'login') return b.loginActivity - a.loginActivity;
      if (sortBy === 'admissions') return b.admissions.total - a.admissions.total;
      return 0;
    });

  const activeBranch = selectedBranch !== 'all' ? allBranches.find(b => b._id === selectedBranch) : null;

  const handleExportBranches = () => {
    const rows = filtered.map(b => ({
      Branch: b.branchName, City: b.branchCity, Code: b.branchCode, Manager: b.managerName,
      'Total Students': b.students.total, 'Approved': b.students.approved,
      'Today': b.students.today, 'This Week': b.students.week,
      'This Month': b.students.month, 'This Year': b.students.year,
      'Login Activity (7d)': b.loginActivity,
      'Total Admissions': b.admissions.total, 'Approved Admissions': b.admissions.approved,
      'Results': b.results, 'Certificates': b.certificates,
    }));
    exportCSV(rows, `kci-branch-analytics-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportLoginActivity = () => {
    exportCSV(data?.loginActivity || [], `kci-login-activity-${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const [exportingMonthly, setExportingMonthly] = useState(false);

  const handleExportMonthlyStudents = async () => {
    setExportingMonthly(true);
    try {
      const params = selectedBranch !== 'all' ? `?branchId=${selectedBranch}` : '';
      const { data: res } = await api.get(`/admin/monthly-students-detail${params}`);
      if (!res.rows?.length) { setExportingMonthly(false); return; }
      const keys = Object.keys(res.rows[0]);
      const csvRows = [
        keys.join(','),
        ...res.rows.map(r => keys.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(',')),
      ];
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const suffix = activeBranch ? `-${activeBranch.branchCode}` : '';
      a.download = `kci-registrations${suffix}-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    } catch {}
    setExportingMonthly(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const g = data?.global || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics & Performance</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Branch-wise performance, login activity & student trends</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedBranch}
            onChange={e => { setSelectedBranch(e.target.value); setSearch(''); }}
            className="flex-1 sm:flex-none px-2 py-1.5 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 bg-white shadow-sm min-w-0 sm:max-w-[180px]"
          >
            <option value="all">All Branches</option>
            {allBranches.map(b => (
              <option key={b._id} value={b._id}>{b.branchName} ({b.branchCode})</option>
            ))}
          </select>
          <button onClick={handleExportBranches} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-emerald-700 transition-colors shadow-sm">
            <Download className="w-3.5 h-3.5" /> Export
          </button>
          <button onClick={() => fetchData(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Global / Branch Student Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: 'Total Students', value: activeBranch ? activeBranch.students.total : g.totalStudents, icon: Users, color: 'bg-blue-500', sub: activeBranch ? activeBranch.branchName : 'All time' },
          { label: 'Today', value: activeBranch ? activeBranch.students.today : g.todayStudents, icon: Calendar, color: 'bg-green-500', sub: 'New today' },
          { label: 'This Week', value: activeBranch ? activeBranch.students.week : g.weekStudents, icon: TrendingUp, color: 'bg-violet-500', sub: 'Last 7 days' },
          { label: 'This Month', value: activeBranch ? activeBranch.students.month : g.monthStudents, icon: Activity, color: 'bg-orange-500', sub: 'Current month' },
          { label: 'This Year', value: activeBranch ? activeBranch.students.year : g.yearStudents, icon: Award, color: 'bg-teal-500', sub: 'Current year' },
        ].map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <StatCard {...c} />
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Student Registrations */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900">Monthly Student Registrations</h2>
              <p className="text-xs text-gray-400">
                {activeBranch ? `${activeBranch.branchName} — last 12 months` : 'All branches — last 12 months'}
              </p>
            </div>
            <button onClick={handleExportMonthlyStudents} disabled={exportingMonthly} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-xs font-medium text-gray-500 disabled:opacity-50" title="Download full student details (CSV)">
              <Download className={`w-4 h-4 ${exportingMonthly ? 'animate-bounce text-blue-500' : 'text-gray-400'}`} />
              {exportingMonthly ? 'Downloading...' : 'Full Details'}
            </button>
          </div>
          {(() => {
            const chartData = activeBranch?.monthlyStudents?.length ? activeBranch.monthlyStudents : data?.monthlyStudents;
            return chartData?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="stuGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#stuGrad)" name="Students" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>
            );
          })()}
        </motion.div>

        {/* Login Activity */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900">Login Activity</h2>
              <p className="text-xs text-gray-400">Daily student activity (last 30 days)</p>
            </div>
            <button onClick={handleExportLoginActivity} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" title="Export CSV">
              <Download className="w-4 h-4 text-gray-400" />
            </button>
          </div>
          {data?.loginActivity?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data.loginActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 9 }}
                  tickFormatter={d => {
                    const dt = new Date(d);
                    return `${dt.getDate()} ${dt.toLocaleString('en',{month:'short'})}`;
                  }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                  labelFormatter={d => {
                    const dt = new Date(d);
                    return dt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
                  }}
                  formatter={(v) => [v, 'Active Students']}
                />
                <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981' }} activeDot={{ r: 5 }} name="Active Students" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No login data yet</div>
          )}
        </motion.div>
      </div>

      {/* Single Branch Report Panel */}
      {activeBranch && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
          {/* Branch Header */}
          <div className="bg-white border-b border-blue-100 px-3 sm:px-5 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-blue-600 flex items-center justify-center shadow shrink-0">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 truncate">{activeBranch.branchName}</h2>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">{activeBranch.branchCode} · {activeBranch.branchCity} · {activeBranch.managerName}</p>
              </div>
            </div>
            <button onClick={() => setSelectedBranch('all')} className="text-xs px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors shrink-0">
              ✕ Clear
            </button>
          </div>

          {/* Branch Stat Cards */}
          <div className="p-3 sm:p-5 grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            {[
              { label: 'Total', value: activeBranch.students.total, color: 'bg-blue-500' },
              { label: 'Today', value: activeBranch.students.today, color: 'bg-green-500' },
              { label: 'Week', value: activeBranch.students.week, color: 'bg-violet-500' },
              { label: 'Month', value: activeBranch.students.month, color: 'bg-orange-500' },
              { label: 'Year', value: activeBranch.students.year, color: 'bg-teal-500' },
              { label: 'Login 7d', value: activeBranch.loginActivity, color: 'bg-pink-500' },
            ].map(c => (
              <div key={c.label} className="bg-white rounded-xl p-2 sm:p-3 border border-gray-100 shadow-sm text-center">
                <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-lg ${c.color} flex items-center justify-center mx-auto mb-1.5`}>
                  <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                </div>
                <p className="text-lg sm:text-xl font-bold text-gray-900">{c.value}</p>
                <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">{c.label}</p>
              </div>
            ))}
          </div>

          {/* Branch Detail Row */}
          <div className="px-3 sm:px-5 pb-3 sm:pb-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Admissions */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Admissions</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Total</span><span className="font-bold text-gray-900">{activeBranch.admissions.total}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Approved</span><span className="font-semibold text-green-600">{activeBranch.admissions.approved}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Pending</span><span className="font-semibold text-orange-500">{activeBranch.admissions.pending}</span></div>
              </div>
            </div>
            {/* Results & Certs */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Results & Certificates</p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Results Published</span><span className="font-bold text-gray-900">{activeBranch.results}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Certificates Issued</span><span className="font-bold text-gray-900">{activeBranch.certificates}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Approved Students</span><span className="font-semibold text-blue-600">{activeBranch.students.approved}</span></div>
              </div>
            </div>
            {/* Approval Rate */}
            <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Approval Rate</p>
              <div className="flex items-center justify-center h-16">
                <div className="text-center">
                  <p className="text-3xl font-black text-blue-600">
                    {activeBranch.students.total > 0 ? Math.round((activeBranch.students.approved / activeBranch.students.total) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{activeBranch.students.approved} of {activeBranch.students.total} approved</p>
                </div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{ width: `${activeBranch.students.total > 0 ? Math.min((activeBranch.students.approved / activeBranch.students.total) * 100, 100) : 0}%` }} />
              </div>
            </div>
          </div>

          {/* Branch Monthly Chart */}
          {activeBranch.monthlyStudents?.length > 0 && (
            <div className="px-5 pb-5">
              <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-sm font-bold text-gray-900 mb-3">Monthly Student Registrations — {activeBranch.branchName}</p>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={activeBranch.monthlyStudents} barSize={24}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                    <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]} fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Branch Performance Table */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-3 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-bold text-gray-900">Branch-wise Performance</h2>
            <p className="text-xs text-gray-400">{filtered.length} branches · Tap row to view report</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search branch..."
              className="flex-1 sm:flex-none px-3 py-1.5 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400 min-w-0 sm:w-40"
            />
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}
              className="flex-1 sm:flex-none px-2 py-1.5 text-xs sm:text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-400">
              <option value="students">Total Students</option>
              <option value="month">This Month</option>
              <option value="login">Login Activity</option>
              <option value="admissions">Admissions</option>
            </select>
            <button onClick={handleExportBranches} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-medium hover:bg-emerald-700 transition-colors">
              <Download className="w-3 h-3" /> CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Branch</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-green-600 uppercase tracking-wide">Today</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-blue-600 uppercase tracking-wide">Week</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-violet-600 uppercase tracking-wide">Month</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-orange-600 uppercase tracking-wide">Year</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Login (7d)</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Admissions</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Results</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Certs</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={11} className="px-4 py-12 text-center text-gray-400">No branches found</td></tr>
              ) : (
                filtered.map((b, i) => <BranchRow key={b._id} b={b} idx={i} onSelect={id => { setSelectedBranch(id); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />)
              )}
            </tbody>
          </table>
        </div>

        {/* Summary footer */}
        {filtered.length > 0 && (
          <div className="px-3 sm:px-4 py-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2 sm:gap-4 text-xs text-gray-500">
            <span>Students: <strong className="text-gray-800">{filtered.reduce((s, b) => s + b.students.total, 0)}</strong></span>
            <span>Month: <strong className="text-violet-700">{filtered.reduce((s, b) => s + b.students.month, 0)}</strong></span>
            <span>Login: <strong className="text-green-700">{filtered.reduce((s, b) => s + b.loginActivity, 0)}</strong></span>
            <span>Admissions: <strong className="text-gray-800">{filtered.reduce((s, b) => s + b.admissions.total, 0)}</strong></span>
            <span>Results: <strong className="text-gray-800">{filtered.reduce((s, b) => s + b.results, 0)}</strong></span>
            <span>Certs: <strong className="text-gray-800">{filtered.reduce((s, b) => s + b.certificates, 0)}</strong></span>
          </div>
        )}
      </motion.div>

      {/* Branch Performance Bar Chart */}
      {filtered.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-1">All Branches — Student Comparison</h2>
          <p className="text-xs text-gray-400 mb-4">Total vs This Month vs This Week</p>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={filtered.slice(0, 20).map(b => ({ name: b.branchCode || b.branchName?.slice(0, 8), total: b.students.total, month: b.students.month, week: b.students.week }))} barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="total" name="Total" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="month" name="This Month" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="week" name="This Week" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
