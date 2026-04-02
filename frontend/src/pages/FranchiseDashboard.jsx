import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Users, TrendingUp, Award, Bell, LogOut, BookOpen, Phone, MapPin, CheckCircle, Clock, XCircle, ClipboardList, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function FranchiseDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admFilter, setAdmFilter] = useState('Pending');
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'franchise') { navigate('/login'); return; }
    fetchAll();
  }, [user]);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      api.get('/franchise/dashboard-stats').catch(() => ({ data: { stats: {} } })),
      api.get('/notifications?role=franchise').catch(() => ({ data: { notifications: [] } })),
      api.get('/admissions/my').catch(() => ({ data: { admissions: [] } })),
    ]).then(([statsRes, notifRes, admRes]) => {
      setStats(statsRes.data.stats || {});
      setNotifications(notifRes.data.notifications || []);
      setAdmissions(admRes.data.admissions || []);
    }).finally(() => setLoading(false));
  };

  const handleStatus = async (id, status) => {
    setUpdating(id);
    try {
      const { data } = await api.put(`/admissions/${id}`, { status });
      setAdmissions(p => p.map(a => a._id === id ? { ...a, status, enrollmentId: data.admission?.enrollmentId } : a));
      toast.success(status === 'Approved' ? '✅ Approved! Student email sent.' : '❌ Admission rejected.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setUpdating(null);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  if (!user || user.role !== 'franchise') return null;
  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin" /></div>;

  const cards = [
    { icon: Users, label: 'Total Students', value: stats.students || 0, color: 'from-blue-500 to-blue-600' },
    { icon: BookOpen, label: 'Active Courses', value: stats.courses || 0, color: 'from-emerald-500 to-emerald-600' },
    { icon: Award, label: 'Certificates', value: stats.certificates || 0, color: 'from-violet-500 to-violet-600' },
    { icon: ClipboardList, label: 'Admissions', value: admissions.length, color: 'from-orange-500 to-orange-600' },
  ];

  const filteredAdm = admissions.filter(a => admFilter === 'All' ? true : a.status === admFilter);

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
          {cards.map(({ icon: Icon, label, value, color }, i) => (
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
          <div className="lg:col-span-2 space-y-6">

            {/* ── Admissions Section ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                <h2 className="font-black text-gray-900 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-green-600" /> Student Admissions
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {['Pending', 'Approved', 'Rejected', 'All'].map(f => (
                      <button key={f} onClick={() => setAdmFilter(f)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${admFilter === f
                          ? f === 'Pending' ? 'bg-yellow-500 text-white'
                            : f === 'Approved' ? 'bg-green-600 text-white'
                            : f === 'Rejected' ? 'bg-red-500 text-white'
                            : 'bg-gray-700 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                        {f}
                        {f === 'Pending' && admissions.filter(a => a.status === 'Pending').length > 0 && (
                          <span className="ml-1 bg-white/30 rounded-full px-1">{admissions.filter(a => a.status === 'Pending').length}</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <button onClick={fetchAll} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>

              {filteredAdm.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <ClipboardList className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  <p className="text-sm">No {admFilter.toLowerCase()} admissions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAdm.map((a, i) => (
                    <motion.div key={a._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                      className="border border-gray-100 rounded-xl p-4 hover:border-green-200 transition-colors">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900 text-sm">{a.name}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                              a.status === 'Approved' ? 'bg-green-100 text-green-700'
                              : a.status === 'Rejected' ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'}`}>
                              {a.status}
                            </span>
                            {a.enrollmentId && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-mono font-bold">{a.enrollmentId}</span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 space-y-0.5">
                            <div>{a.email} · {a.phone}</div>
                            <div>Course: <span className="font-semibold text-gray-700">{a.course?.title || 'N/A'}</span> · {a.qualification}</div>
                            <div className="text-gray-400">{new Date(a.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                          </div>
                        </div>
                        {a.status === 'Pending' && (
                          <div className="flex gap-2 shrink-0">
                            <button onClick={() => handleStatus(a._id, 'Approved')} disabled={updating === a._id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-60">
                              {updating === a._id ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                              Approve
                            </button>
                            <button onClick={() => handleStatus(a._id, 'Rejected')} disabled={updating === a._id}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors disabled:opacity-60">
                              <XCircle className="w-3.5 h-3.5" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
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

          {/* Right Column */}
          <div className="space-y-6">
            {/* Notifications */}
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
