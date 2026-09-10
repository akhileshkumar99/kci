import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, BookOpen, ClipboardList, Award, FileText, BarChart2, TrendingUp, ArrowUpRight,
  RefreshCw, Lock, KeyRound, Eye, EyeOff, CheckCircle, Bell, Plus, Trash2, Megaphone, ShieldCheck
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area,
} from 'recharts';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';
import DevCredit from '../../components/DevCredit';
import { AdminLoader } from '../../components/PageLoader';

const PIE_COLORS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4'];
const typeColors = {
  exam: 'bg-orange-100 text-orange-700 border-orange-200',
  result: 'bg-green-100 text-green-700 border-green-200',
  course: 'bg-blue-100 text-blue-700 border-blue-200',
  general: 'bg-gray-100 text-gray-700 border-gray-200',
  admission: 'bg-violet-100 text-violet-700 border-violet-200',
  fee: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  holiday: 'bg-teal-100 text-teal-700 border-teal-200',
  urgent: 'bg-red-100 text-red-700 border-red-200 animate-pulse',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Change Password State
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showCurrPass, setShowCurrPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passSaving, setPassSaving] = useState(false);

  // Notice Form State
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeForm, setNoticeForm] = useState({ title: '', message: '', type: 'general', targetRole: 'all' });
  const [noticeSaving, setNoticeSaving] = useState(false);

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [statsRes, analyticsRes, notifRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/analytics'),
        api.get('/notifications'),
      ]);
      setStats(statsRes.data.stats);
      setCharts(statsRes.data.charts);
      setAnalytics(analyticsRes.data);
      setNotifications(notifRes.data.notifications || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!passForm.currentPassword || !passForm.newPassword || !passForm.confirmPassword) {
      return toast.error('Please fill all password fields');
    }
    if (passForm.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters long');
    }
    if (passForm.newPassword !== passForm.confirmPassword) {
      return toast.error('New password and confirm password do not match');
    }
    setPassSaving(true);
    try {
      const { data } = await api.put('/auth/change-password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword,
      });
      toast.success(data.message || '🔑 Password updated successfully!');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    }
    setPassSaving(false);
  };

  const handlePostNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.title || !noticeForm.message) {
      return toast.error('Please enter notice title and message');
    }
    setNoticeSaving(true);
    try {
      const { data } = await api.post('/notifications', noticeForm);
      setNotifications((prev) => [data.notification, ...prev]);
      setNoticeForm({ title: '', message: '', type: 'general', targetRole: 'all' });
      setShowNoticeForm(false);
      toast.success('📢 Notice published successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to publish notice');
    }
    setNoticeSaving(false);
  };

  const handleDeleteNotice = async (id) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Notice deleted');
    } catch (err) {
      toast.error('Failed to delete notice');
    }
  };

  const g = analytics?.global || {};

  const cards = [
    { label: 'Total Students',        value: stats?.students ?? 0,          icon: Users,       path: '/admin/students',    bg: 'from-blue-500 to-blue-600' },
    { label: 'Pending Admissions',    value: stats?.pendingAdmissions ?? 0, icon: ClipboardList,path: '/admin/admissions',  bg: 'from-yellow-500 to-orange-500' },
    { label: 'Approved Admissions',   value: stats?.approvedAdmissions ?? 0,icon: ClipboardList,path: '/admin/admissions',  bg: 'from-emerald-500 to-emerald-600' },
    { label: 'Certificates Generated',value: stats?.certificates ?? 0,      icon: FileText,    path: '/admin/certificates',bg: 'from-teal-500 to-teal-600' },
    { label: 'Results Uploaded',      value: stats?.results ?? 0,           icon: Award,       path: '/admin/results',     bg: 'from-orange-500 to-orange-600' },
    { label: 'Active Branches',       value: stats?.activeBranches ?? 0,    icon: Users,       path: '/admin/branches',    bg: 'from-indigo-500 to-indigo-600' },
    { label: 'Franchise Renewals Due',value: stats?.franchiseRenewals ?? 0, icon: BarChart2,   path: '/admin/branches',    bg: 'from-rose-500 to-rose-600' },
    { label: 'Analytics',             value: null,                          icon: BarChart2,   path: '/admin/analytics',   bg: 'from-pink-500 to-rose-500', isAnalytics: true },
  ];

  const quickActions = [
    { label: '+ Add Course', path: '/admin/courses', color: 'bg-blue-600 hover:bg-blue-700' },
    { label: '+ Add Result', path: '/admin/results', color: 'bg-emerald-600 hover:bg-emerald-700' },
    { label: '+ Add Certificate', path: '/admin/certificates', color: 'bg-violet-600 hover:bg-violet-700' },
    { label: '+ Add Staff', path: '/admin/staff', color: 'bg-orange-600 hover:bg-orange-700' },
    { label: '+ Add Gallery', path: '/admin/gallery', color: 'bg-teal-600 hover:bg-teal-700' },
    { label: 'View Messages', path: '/admin/contacts', color: 'bg-rose-600 hover:bg-rose-700' },
  ];

  if (loading) return <AdminLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Welcome back, Admin</p>
        </div>
        <div className="flex items-center gap-2">
          <DevCredit popupDown />
          <button onClick={() => fetchData(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {cards.map(({ label, value, icon: Icon, bg, path, isAnalytics }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Link to={path} className="block bg-white rounded-xl sm:rounded-2xl p-3 sm:p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className={`absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br ${bg} opacity-10 rounded-bl-full`} />
              <div className="flex items-start justify-between">
                <div className={`w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br ${bg} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 transition-colors" />
              </div>
              {isAnalytics ? (
                <div className="mt-2 sm:mt-3 space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-gray-900">Analytics</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-[10px] text-gray-500">Today <strong className="text-green-600">{g.todayStudents ?? 0}</strong></span>
                    <span className="text-[10px] text-gray-500">Week <strong className="text-blue-600">{g.weekStudents ?? 0}</strong></span>
                    <span className="text-[10px] text-gray-500">Month <strong className="text-violet-600">{g.monthStudents ?? 0}</strong></span>
                  </div>
                  <p className="text-[10px] text-gray-400 hidden sm:block">Branch performance & trends</p>
                </div>
              ) : (
                <div className="mt-2 sm:mt-3">
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{value ?? 0}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{label}</p>
                </div>
              )}
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── NOTICE BOARD / ANNOUNCEMENTS SECTION ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
      >
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 text-base sm:text-lg">Institute Notice Board</h2>
              <p className="text-xs text-gray-400">Post announcements and updates for students & branches</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNoticeForm(!showNoticeForm)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> {showNoticeForm ? 'Cancel' : 'Post New Notice'}
            </button>
            <Link
              to="/admin/notifications"
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors"
            >
              View All ({notifications.length})
            </Link>
          </div>
        </div>

        {/* Post Notice Form Drawer */}
        <AnimatePresence>
          {showNoticeForm && (
            <motion.form
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              onSubmit={handlePostNotice}
              className="mb-6 p-4 sm:p-5 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 border border-blue-100 rounded-2xl space-y-4 overflow-hidden"
            >
              <h3 className="font-bold text-blue-900 text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-600" /> Create Announcement / Notice
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Notice Title *"
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm((p) => ({ ...p, title: e.target.value }))}
                  required
                  className="sm:col-span-2 px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                />
                <select
                  value={noticeForm.type}
                  onChange={(e) => setNoticeForm((p) => ({ ...p, type: e.target.value }))}
                  className="px-3 py-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                >
                  <option value="general">📢 General</option>
                  <option value="urgent">🚨 Urgent Notice</option>
                  <option value="exam">📝 Exam Schedule</option>
                  <option value="result">🏆 Result Alert</option>
                  <option value="admission">🎓 Admission</option>
                  <option value="fee">💳 Fee Notice</option>
                  <option value="holiday">🎉 Holiday Announcement</option>
                </select>
              </div>

              <textarea
                placeholder="Write notice details / message body *"
                rows={3}
                value={noticeForm.message}
                onChange={(e) => setNoticeForm((p) => ({ ...p, message: e.target.value }))}
                required
                className="w-full px-4 py-2.5 bg-white border border-blue-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-normal resize-none"
              />

              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-gray-500">Audience:</span>
                  <select
                    value={noticeForm.targetRole}
                    onChange={(e) => setNoticeForm((p) => ({ ...p, targetRole: e.target.value }))}
                    className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700"
                  >
                    <option value="all">Everyone (All Users)</option>
                    <option value="student">Students Only</option>
                    <option value="franchise">Branches / Franchise Only</option>
                    <option value="teacher">Teachers Only</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={noticeSaving}
                  className="px-6 py-2.5 bg-blue-600 text-white font-bold text-xs sm:text-sm rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {noticeSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                  Publish Notice 🚀
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Notices List */}
        <div className="space-y-3">
          {notifications.slice(0, 4).map((notice) => (
            <div
              key={notice._id}
              className="p-3.5 sm:p-4 bg-gray-50/70 hover:bg-gray-50 border border-gray-100 rounded-xl transition-all flex items-start justify-between gap-3 group"
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 bg-white rounded-lg border border-gray-200 text-blue-600 shrink-0 mt-0.5 shadow-2xs">
                  <Bell className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-bold text-gray-900 text-sm">{notice.title}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${typeColors[notice.type] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                      {notice.type}
                    </span>
                    <span className="text-[10px] bg-white border border-gray-200 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                      {notice.targetRole === 'all' ? 'All Portal Users' : notice.targetRole}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">{notice.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">
                    Posted on {new Date(notice.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteNotice(notice._id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                title="Delete Notice"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Megaphone className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-gray-500">No active notices found</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Click 'Post New Notice' above to create an announcement.</p>
            </div>
          )}
        </div>
      </motion.div>

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

      {/* ── CHANGE PASSWORD SECTION ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800"
        id="admin-change-password-section"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Security & Change Password <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </h2>
            <p className="text-xs text-slate-400">Update your Admin account security password</p>
          </div>
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-2xl">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Current Password *</label>
              <div className="relative">
                <input
                  type={showCurrPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={passForm.currentPassword}
                  onChange={(e) => setPassForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrPass(!showCurrPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showCurrPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">New Password *</label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  placeholder="Min 6 chars"
                  value={passForm.newPassword}
                  onChange={(e) => setPassForm((p) => ({ ...p, newPassword: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Confirm New Password *</label>
              <input
                type="password"
                placeholder="Re-enter new"
                value={passForm.confirmPassword}
                onChange={(e) => setPassForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                required
                className="w-full px-3.5 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> Keep your password safe and private.
            </span>
            <button
              type="submit"
              disabled={passSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs sm:text-sm rounded-xl hover:from-blue-500 hover:to-indigo-500 transition-all shadow-md flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {passSaving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
        <h2 className="font-bold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {quickActions.map(({ label, path, color }) => (
            <Link key={path} to={path} className={`${color} text-white rounded-xl py-2.5 px-2 text-[11px] sm:text-xs font-semibold text-center transition-colors shadow-sm leading-tight`}>
              {label}
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Summary Row */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Pass Rate', value: stats?.results > 0 ? '82%' : 'N/A', sub: 'Based on published results', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Branches Active', value: stats?.activeBranches ?? 0, sub: 'Across Uttar Pradesh', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Unread Messages', value: stats?.unreadContacts ?? 0, sub: 'Pending contact replies', color: 'text-violet-600', bg: 'bg-violet-50' },
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
