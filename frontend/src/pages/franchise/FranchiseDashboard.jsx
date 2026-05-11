import { useEffect, useState, useRef, useCallback } from 'react';
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
  const counterRefs = useRef({});

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data } = await api.get('/franchise/dashboard-stats');
      setStats(data.stats);
      // Mock charts data - replace with real franchise data
      setCharts({
        admissions: [
          { name: 'Jan', count: 2 },
          { name: 'Feb', count: 5 },
          { name: 'Mar', count: 3 },
          { name: 'Apr', count: 8 },
        ],
        courseCategories: [
          { name: 'Certificate', value: 12 },
          { name: 'Diploma', value: 5 },
          { name: 'Professional', value: 4 },
        ],
        results: [
          { name: 'Jan', count: 1 },
          { name: 'Feb', count: 3 },
          { name: 'Mar', count: 2 },
          { name: 'Apr', count: 5 },
        ],
      });
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    setRefreshing(false);
    
    // Trigger counter animations
    Object.values(counterRefs.current).forEach(ref => {
      if (ref) ref.current = 0;
    });
  };

  useEffect(() => { fetchData(); }, []);

  const cards = [
    { label: 'Total Students', value: stats?.students || 0, icon: Users, color: 'blue', path: '/franchise/students', bg: 'from-blue-500 to-blue-600' },
    { label: 'Active Courses', value: stats?.courses || 0, icon: BookOpen, color: 'green', path: '/franchise/courses', bg: 'from-emerald-500 to-emerald-600' },
    { label: 'Pending Admissions', value: stats?.admissions || 0, icon: ClipboardList, color: 'purple', path: '/franchise/admissions', bg: 'from-violet-500 to-violet-600' },
    { label: 'Results', value: stats?.results || 0, icon: Award, color: 'orange', path: '/franchise/results', bg: 'from-orange-500 to-orange-600' },
    { label: 'Certificates', value: stats?.certificates || 0, icon: FileText, color: 'teal', path: '/franchise/certificates', bg: 'from-teal-500 to-teal-600' },
    { label: 'Unread Messages', value: stats?.unreadContacts || 0, icon: MessageSquare, color: 'red', path: '/franchise/contacts', bg: 'from-rose-500 to-rose-600' },
  ];

  const quickActions = [
    { label: '+ Add Student', path: '/franchise/students', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: '+ Add Result', path: '/franchise/results', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: '+ Add Certificate', path: '/franchise/certificates', color: 'bg-violet-600 hover:bg-violet-700' },
    { label: '+ Manage Gallery', path: '/franchise/gallery', color: 'bg-orange-600 hover:bg-orange-700' },
    { label: 'View Messages', path: '/franchise/contacts', color: 'bg-teal-600 hover:bg-teal-700' },
    { label: 'Manage Quiz', path: '/franchise/quiz', color: 'bg-rose-600 hover:bg-rose-700' },
  ];

  const AnimatedCounter = ({ target, className, ref }) => {
    const countRef = useRef(0);
    const mounted = useRef(false);
    
    useEffect(() => {
      mounted.current = true;
      const duration = 2000;
      const start = Date.now();
      const increment = target / (duration / 16);
      
      const animate = () => {
        const elapsed = Date.now() - start;
        if (elapsed < duration && mounted.current) {
          countRef.current = Math.min(target, (elapsed / duration) * target);
          requestAnimationFrame(animate);
        } else {
          countRef.current = target;
        }
      };
      animate();
      
      return () => { mounted.current = false; };
    }, [target]);
    
    return (
      <span className={className}>
        {Math.floor(countRef.current).toLocaleString()}
      </span>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Advanced Franchise Hero */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="particles-bg relative bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 rounded-3xl p-8 mb-8 text-white overflow-hidden"
      >
        {/* Floating Particles */}
        {Array.from({length: 6}).map((_, i) => (
          <div key={i} className={`particle absolute top-1/4 w-full h-full`} style={{animationDelay: `${i * 0.5}s`}} />
        ))}
        
        <div className="relative z-10">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="text-3xl font-black bg-white/20 backdrop-blur-sm px-4 py-2 rounded-2xl glass">
                  🏢 KCI Franchise Portal
                </div>
                <div className="text-sm bg-white/10 backdrop-blur-sm px-3 py-1 rounded-xl font-semibold">
                  Test Center - Ayodhya
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-black mb-2 leading-tight">
                Welcome, <span className="text-yellow-300 drop-shadow-lg">Franchise Manager</span>!
              </h1>
              <div className="flex items-center gap-4 flex-wrap mb-4 text-lg">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl">
                  <span>Center:</span>
                  <span className="font-bold text-xl">Test Center - Ayodhya</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm opacity-90">Code:</span>
                  <span className="hero-badge text-lg font-mono font-black px-4 py-2 rounded-2xl shadow-2xl bg-white/20 backdrop-blur-sm border border-white/30">
                    KCI-F-TEST001
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="approved-glow inline-flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-sm rounded-2xl font-bold text-lg shadow-xl border border-white/30">
                  ✅ Approved Center
                </div>
                <div className="text-yellow-300 text-lg font-bold">Ayodhya</div>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchData(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-2xl text-lg font-bold border border-white/30 hover:bg-white/30 transition-all shadow-2xl hover:shadow-emerald-500/25"
            >
              <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Updating...' : 'Refresh Data'}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, bg, path }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <motion.div 
              className="block bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group overflow-hidden relative cursor-pointer"
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              variants={{
                initial: { rotateX: 0, rotateY: 0, rotateZ: 0 },
                hover: { 
                  rotateX: -5, 
                  rotateY: 5, 
                  rotateZ: 1,
                  y: -8,
                  scale: 1.02
                },
                tap: { scale: 0.98 }
              }}
            >
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${bg} opacity-10 rounded-bl-full`} />
              <div className="flex items-start justify-between">
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
              <div className="mt-3">
                <AnimatedCounter ref={(el) => { counterRefs.current[label] = el; }} target={value} className="text-3xl font-bold text-gray-900" />
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
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} fill="url(#admGrad)" name="Admissions" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Course Categories Pie */}
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
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
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
            <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map(({ label, path, color }) => (
          <motion.div 
            key={path} 
            className={`${color} text-white rounded-xl py-3 px-3 text-xs font-semibold text-center transition-all shadow-sm cursor-pointer`}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
            custom={path}
            variants={{
              initial: { rotateX: 0, rotateY: 0 },
              hover: { 
                rotateX: -3, 
                rotateY: 3,
                scale: 1.1,
                y: -4
              },
              tap: { scale: 0.95 }
            }}
          >
              {label}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Summary Row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Pass Rate', value: stats?.results > 0 ? '92%' : 'N/A', sub: 'Your center results', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Your Students', value: stats?.active || 0, sub: 'Active enrollments', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Franchise Rank', value: 'Top 5', sub: 'Among all centers', color: 'text-violet-600', bg: 'bg-violet-50' },
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

