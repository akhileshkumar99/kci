import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Users, TrendingUp, Award, Bell, LogOut, BookOpen, Phone, MapPin, BarChart2, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function FranchiseDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ students: 0, courses: 0, admissions: 0 });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'franchise') { navigate('/login'); return; }
    Promise.all([
      api.get('/franchise/dashboard-stats').catch(() => ({ data: { stats: {} } })),
      api.get('/notifications?role=franchise').catch(() => ({ data: { notifications: [] } })),
    ]).then(([statsRes, notifRes]) => {
      setStats(statsRes.data.stats || {});
      setNotifications(notifRes.data.notifications || []);
    }).finally(() => setLoading(false));
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  if (!user || user.role !== 'franchise') return null;
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;

  const cards = [
    { icon: Users, label: 'Total Students', value: stats.students || 0, color: 'from-blue-500 to-blue-600' },
    { icon: BookOpen, label: 'Active Courses', value: stats.courses || 0, color: 'from-emerald-500 to-emerald-600' },
    { icon: Award, label: 'Certificates', value: stats.certificates || 0, color: 'from-violet-500 to-violet-600' },
    { icon: TrendingUp, label: 'Results', value: stats.results || 0, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="KCI" className="w-9 h-9 rounded-xl object-cover" />
            <div>
              <div className="font-black text-gray-900 text-sm">KCI Franchise Portal</div>
              <div className="text-xs text-green-600 font-semibold">{user.franchiseCenter || 'My Center'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-bold text-gray-900">{user.name}</div>
              <div className="text-xs text-gray-400">{user.franchiseCity}</div>
            </div>
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-semibold">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-emerald-700 rounded-3xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-black">Welcome, {user.name}! 🏢</h1>
              <p className="text-green-200 text-sm mt-1">Center: {user.franchiseCenter} | Code: {user.franchiseCode || 'Pending'}</p>
              <div className={`inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full text-xs font-bold ${user.isApproved ? 'bg-white/20 text-white' : 'bg-yellow-400/20 text-yellow-300'}`}>
                {user.isApproved ? <><CheckCircle className="w-3.5 h-3.5" /> Approved Center</> : <><Clock className="w-3.5 h-3.5" /> Approval Pending</>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-yellow-400">{user.franchiseCity}</div>
              <div className="text-green-200 text-sm">Location</div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map(({ icon: Icon, label, value, color, bg }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-xl font-black text-gray-900">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Quick Actions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-black text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { label: 'View Courses', icon: BookOpen, path: '/courses', color: 'bg-blue-50 text-blue-600' },
                  { label: 'Notifications', icon: Bell, path: '/notifications', color: 'bg-orange-50 text-orange-600' },
                  { label: 'Study Material', icon: Award, path: '/study-material', color: 'bg-violet-50 text-violet-600' },
                  { label: 'Quiz System', icon: TrendingUp, path: '/quiz', color: 'bg-pink-50 text-pink-600' },
                  { label: 'Contact KCI', icon: Phone, path: '/contact', color: 'bg-green-50 text-green-600' },
                  { label: 'View Branches', icon: MapPin, path: '/branches', color: 'bg-teal-50 text-teal-600' },
                ].map(({ label, icon: Icon, path, color }) => (
                  <Link key={path} to={path} className={`flex flex-col items-center gap-2 p-4 ${color} rounded-xl hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6" />
                    <span className="text-xs font-semibold text-center">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Center Info */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="font-black text-gray-900 mb-4">Center Information</h2>
              <div className="space-y-3">
                {[
                  { label: 'Center Name', value: user.franchiseCenter || 'N/A', icon: Building2 },
                  { label: 'City', value: user.franchiseCity || 'N/A', icon: MapPin },
                  { label: 'Franchise Code', value: user.franchiseCode || 'Pending Approval', icon: Award },
                  { label: 'Contact', value: user.phone || 'N/A', icon: Phone },
                  { label: 'Email', value: user.email, icon: Bell },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Icon className="w-4 h-4 text-green-600 shrink-0" />
                    <div>
                      <div className="text-xs text-gray-400">{label}</div>
                      <div className="text-sm font-semibold text-gray-800">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-green-600" />
                <h2 className="font-black text-gray-900">Notifications</h2>
              </div>
              {notifications.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No notifications</p>
              ) : (
                <div className="space-y-3">
                  {notifications.slice(0, 5).map(n => (
                    <div key={n._id} className="p-3 bg-green-50 rounded-xl border border-green-100">
                      <div className="text-xs font-bold text-gray-800">{n.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{n.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Support */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-5 text-white">
              <h3 className="font-black mb-3">Need Support?</h3>
              <p className="text-green-200 text-xs mb-4">Contact KCI Head Office for any assistance</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> 9936384736</div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4" /> 9919660880</div>
              </div>
              <a href="https://wa.me/919936384736" target="_blank" rel="noreferrer"
                className="mt-4 block text-center py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-semibold transition-colors">
                WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
