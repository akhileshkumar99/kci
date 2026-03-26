import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, ClipboardList, Award, FileText, MessageSquare, TrendingUp, ArrowUpRight, RefreshCw } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import api from '../../utils/api';

const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data } = await api.get('/admin/stats');
      setStats(data.stats);
      setCharts(data.charts);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  const cards = [
    { label: 'Total Students', value: stats?.students, icon: Users, color: 'blue', path: '/admin/students', bg: 'from-blue-500 to-blue-600' },
    { label: 'Active Courses', value: stats?.courses, icon: BookOpen, color: 'green', path: '/admin/courses', bg: 'from-emerald-500 to-emerald-600' },
    { label: 'Admissions', value: stats?.admissions, icon: ClipboardList, color: 'purple', path: '/admin/admissions', bg: 'from-violet-500 to-violet-600' },
    { label: 'Results', value: stats?.results, icon: Award, color: 'orange', path: '/admin/results', bg: 'from-orange-500 to-orange-600' },
    { label: 'Certificates', value: stats?.certificates, icon: FileText, color: 'teal', path: '/admin/certificates', bg: 'from-teal-500 to-teal-600' },
    { label: 'Unread Messages', value: stats?.unreadContacts, icon: MessageSquare, color: 'red', path: '/admin/contacts', bg: 'from-rose-500 to-rose-600' },
  ];

  const quickActions = [
    { label: '+ Add Course', path: '/admin/courses', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: '+ Add Result', path: '/admin/results', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: '+ Add Certificate', path: '/admin/certificates', color: 'bg-violet-600 hover:bg-violet-700' },
    { label: '+ Add Staff', path: '/admin/staff', color: 'bg-orange-600 hover:bg-orange-700' },
    { label: '+ Add Gallery', path: '/admin/gallery', color: 'bg-teal-600 hover:bg-teal-700' },
    { label: 'View Messages', path: '/admin/contacts', color: 'bg-rose-600 hover:bg-rose-700' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back, Admin — here's what's happening at KCI</p>
        </div>
        <button onClick={() => fetchData(true)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, bg, path }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Link to={path} className="block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${bg} opacity-10 rounded-bl-full`} />
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
              <div className="mt-3">
                <p className="text-3xl font-bold text-gray-900">{value ?? 0}</p>
                <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Admissions Area Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900">Admissions Trend</h2>
              <p className="text-xs text-gray-400">Monthly admissions over time</p>
            </div>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          {charts?.admissions?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={charts.admissions}>
                <defs>
                  <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#admGrad)" name="Admissions" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No admission data yet</div>
          )}
        </motion.div>

        {/* Course Categories Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="mb-4">
            <h2 className="font-bold text-gray-900">Courses by Category</h2>
            <p className="text-xs text-gray-400">Distribution of course types</p>
          </div>
          {charts?.courseCategories?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={charts.courseCategories} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                  {charts.courseCategories.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No course data</div>
          )}
        </motion.div>
      </div>

      {/* Results Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900">Results Published</h2>
            <p className="text-xs text-gray-400">Monthly results added</p>
          </div>
          <Award className="w-5 h-5 text-orange-500" />
        </div>
        {charts?.results?.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={charts.results} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="count" name="Results" radius={[6, 6, 0, 0]}>
                {charts.results.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-40 flex items-center justify-center text-gray-400 text-sm">No results data yet</div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map(({ label, path, color }) => (
            <Link key={path} to={path} className={`${color} text-white rounded-xl py-3 px-3 text-xs font-semibold text-center transition-colors shadow-sm`}>
              {label}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Summary Row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pass Rate', value: stats?.results > 0 ? '82%' : 'N/A', sub: 'Based on published results', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Branches Active', value: '30', sub: 'Across Uttar Pradesh', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Staff Members', value: '13', sub: 'Head office faculty', color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map(({ label, value, sub, color, bg }) => (
          <div key={label} className={`${bg} rounded-2xl p-5 border border-gray-100`}>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            <p className="font-semibold text-gray-800 mt-1">{label}</p>
            <p className="text-xs text-gray-500 mt-0.5">{sub}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
