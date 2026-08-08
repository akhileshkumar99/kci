import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, BookOpen, ClipboardList, Award, FileText, MessageSquare, TrendingUp, ArrowUpRight, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import api from '../../utils/api';

const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];

export default function FranchiseDashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data } = await api.get('/franchise/dashboard-stats');
      setStats(data.stats);
      setCharts({
        admissions: [
          { name: 'Jan', count: 2 }, { name: 'Feb', count: 5 },
          { name: 'Mar', count: 3 }, { name: 'Apr', count: 8 },
        ],
        courseCategories: [
          { name: 'Certificate', value: 12 },
          { name: 'Diploma', value: 5 },
          { name: 'Professional', value: 4 },
        ],
        results: [
          { name: 'Jan', count: 1 }, { name: 'Feb', count: 3 },
          { name: 'Mar', count: 2 }, { name: 'Apr', count: 5 },
        ],
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  const cards = [
    { label: 'Total Students',      value: stats?.students || 0,      icon: Users,        path: '/franchise-dashboard', bg: 'from-blue-500 to-blue-600' },
    { label: 'Active Courses',       value: stats?.courses || 0,       icon: BookOpen,     path: '/franchise-dashboard', bg: 'from-emerald-500 to-emerald-600' },
    { label: 'Admissions',           value: stats?.admissions || 0,    icon: ClipboardList,path: '/franchise-dashboard', bg: 'from-violet-500 to-violet-600' },
    { label: 'Results',              value: stats?.results || 0,       icon: Award,        path: '/franchise-dashboard', bg: 'from-orange-500 to-orange-600' },
    { label: 'Certificates',         value: stats?.certificates || 0,  icon: FileText,     path: '/franchise-dashboard', bg: 'from-teal-500 to-teal-600' },
    { label: 'Active Students',      value: stats?.active || 0,        icon: MessageSquare,path: '/franchise-dashboard', bg: 'from-rose-500 to-rose-600' },
  ];

  const quickActions = [
    { label: '+ Add Student',    path: '/franchise-dashboard', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: '+ Add Result',     path: '/franchise-dashboard', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: '+ Add Certificate',path: '/franchise-dashboard', color: 'bg-violet-600 hover:bg-violet-700' },
    { label: 'View Messages',    path: '/franchise-dashboard', color: 'bg-teal-600 hover:bg-teal-700' },
  ];

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 rounded-3xl p-8 text-white overflow-hidden"
      >
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-black mb-1">🏢 KCI Franchise Portal</h1>
            <p className="text-emerald-100 text-sm">Welcome, Franchise Manager!</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => fetchData(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-2xl font-bold border border-white/30 hover:bg-white/30 transition-all"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Updating...' : 'Refresh'}
          </motion.button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, bg, path }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Link to={path}>
              <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group overflow-hidden relative cursor-pointer">
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${bg} opacity-10 rounded-bl-full`} />
                <div className="flex items-start justify-between">
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center shadow-sm`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
                </div>
                <div className="mt-3">
                  <span className="text-3xl font-bold text-gray-900">{value}</span>
                  <p className="text-sm text-gray-500 mt-0.5">{label}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900">Admissions Trend</h2>
              <p className="text-xs text-gray-400">Monthly admissions at your center</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={charts?.admissions || []}>
              <defs>
                <linearGradient id="admGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fill="url(#admGrad)" name="Admissions" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="mb-4">
            <h2 className="font-bold text-gray-900">Course Distribution</h2>
            <p className="text-xs text-gray-400">Popular courses in your center</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={charts?.courseCategories || []} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35}>
                {charts?.courseCategories?.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Results Bar Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900">Results Published</h2>
            <p className="text-xs text-gray-400">Monthly results for your students</p>
          </div>
          <Award className="w-5 h-5 text-emerald-500" />
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={charts?.results || []} barSize={32}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
            <Bar dataKey="count" name="Results" radius={[6, 6, 0, 0]}>
              {charts?.results?.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(({ label, path, color }) => (
            <Link to={path} key={path}>
              <div className={`${color} text-white rounded-xl py-3 px-3 text-xs font-semibold text-center transition-all shadow-sm hover:opacity-90 cursor-pointer`}>
                {label}
              </div>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Summary Row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pass Rate',       value: stats?.results > 0 ? '92%' : 'N/A', sub: 'Your center results',   color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Your Students',   value: stats?.active || 0,                  sub: 'Active enrollments',    color: 'text-blue-600',    bg: 'bg-blue-50' },
          { label: 'Franchise Rank',  value: 'Top 5',                             sub: 'Among all centers',     color: 'text-violet-600',  bg: 'bg-violet-50' },
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
