import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Users, TrendingUp, Award, Bell, LogOut, BookOpen, Phone, MapPin, CheckCircle, Clock, XCircle, ClipboardList, RefreshCw, Users2, Search as SearchIcon, Plus, X, User, Mail, Phone as PhoneIcon, Hash, CalendarDays, Pencil, Eye, ImagePlus, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const COURSES = [
  'Certificate In Fundamental (CIF)',
  'Certificate in Computer Application (CCA)',
  'Certificate In Office Package & Tally A/C (COPT)',
  'Tally Specialist Course With GST',
  'Advance Diploma in Computer Application (ADCA)',
  'Desktop Publishing (DTP)',
  'Computer Teacher Training Course',
  'I.G.D. Bombay',
  'Certificate In Computer Hardware (CICH)',
  'JAVA, VB.net, ASP.net, PHP',
  'Computer Typing (Hindi + English)',
  'C, C++ Programming',
  'Internet Course',
  'Diploma in Computer Application (DCA)',
  'Certificate In Tally A/c With GST (CIT)',
  'Personality Development',
  'Diploma in Yoga Education (DYEd./DYT)',
  'PG Diploma In Yoga Education (PGDYEd.)',
  'Multimedia Animation Course (N-Mass)',
  'BCA / BBA / MCA / MBA / PGDCA & More',
  'Course On Computer Concept (CCC from NIELIT)',
];

export default function FranchiseDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [admFilter, setAdmFilter] = useState('Pending');
  const [updating, setUpdating] = useState(null);
  
  // Students states
  const [studentSearch, setStudentSearch] = useState('');
  const [addStudentModal, setAddStudentModal] = useState(false);
  const [editStudentModal, setEditStudentModal] = useState(false);
  const [viewStudentModal, setViewStudentModal] = useState(false);
  const [savingStudent, setSavingStudent] = useState(false);
  const [studentForm, setStudentForm] = useState({ name: '', phone: '', courseName: '', batch: '', photo: null });
  const [editStudent, setEditStudent] = useState(null);
  const [viewStudent, setViewStudent] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'franchise') { navigate('/login'); return; }
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, notifRes, admRes, studentsRes] = await Promise.all([
        api.get('/franchise/dashboard-stats').catch(() => ({ data: { stats: {} } })),
        api.get('/notifications?role=franchise').catch(() => ({ data: { notifications: [] } })),
        api.get('/admissions/my').catch(() => ({ data: { admissions: [] } })),
        api.get('/franchise/students').catch(() => ({ data: { students: [] } })),
      ]);
      setStats(statsRes.data.stats || {});
      setNotifications(notifRes.data.notifications || []);
      setAdmissions(admRes.data.admissions || []);
      setStudents(studentsRes.data.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/franchise/students');
      setStudents(data.students || []);
    } catch (err) {
      toast.error('Failed to load students');
    }
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

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.name || !studentForm.courseName) return toast.error('Name and course required');
    setSavingStudent(true);
    try {
      const fd = new FormData();
      fd.append('name', studentForm.name);
      fd.append('phone', studentForm.phone || '');
      fd.append('courseName', studentForm.courseName);
      fd.append('batch', studentForm.batch || '');
      if (studentForm.photo) fd.append('photo', studentForm.photo);
      await api.post('/franchise/students/register', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('✅ Student added successfully!');
      setAddStudentModal(false);
      setStudentForm({ name: '', phone: '', courseName: '', batch: '', photo: null });
      fetchStudents();
      fetchAll(); // refresh stats
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add student');
    }
    setSavingStudent(false);
  };

  const openEdit = (s) => {
    setEditStudent(s);
    setStudentForm({ name: s.name, phone: s.phone || '', courseName: s.courseName || '', batch: s.batch || '', photo: null });
    setEditStudentModal(true);
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    if (!studentForm.name) return toast.error('Name required');
    setSavingStudent(true);
    try {
      const fd = new FormData();
      fd.append('name', studentForm.name);
      fd.append('phone', studentForm.phone);
      fd.append('courseName', studentForm.courseName);
      fd.append('batch', studentForm.batch);
      if (studentForm.photo) fd.append('photo', studentForm.photo);
      await api.put(`/franchise/students/${editStudent._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('✅ Student updated!');
      setEditStudentModal(false);
      setStudentForm({ name: '', phone: '', courseName: '', batch: '', photo: null });
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    }
    setSavingStudent(false);
  };

  const handleDeleteStudent = async (id) => {
    if (!confirm('Delete this student? This cannot be undone.')) return;
    try {
      await api.delete(`/franchise/students/${id}`);
      setStudents(s => s.filter(x => x._id !== id));
      toast.success('🗑️ Student deleted');
      fetchAll(); // refresh stats
    } catch (err) {
      toast.error('Failed to delete');
    }
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

const filteredStudents = students.filter(s =>
    (s.name || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.email || '').toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.rollNumber || '').toLowerCase().includes(studentSearch.toLowerCase())
  );

  const setStudentFormField = (key, value) => setStudentForm(prev => ({ ...prev, [key]: value }));

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

            {/* ── NEW STUDENTS MANAGEMENT SECTION ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  <Users2 className="w-6 h-6 text-blue-600" /> Students Management ({students.length})
                </h2>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-md">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input 
                      value={studentSearch} 
                      onChange={e => setStudentSearch(e.target.value)} 
                      placeholder="Search students by name, email or roll..." 
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                    />
                  </div>
                  <button onClick={() => setAddStudentModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md">
                    <Plus className="w-4 h-4" /> Add Student
                  </button>
                  <button onClick={fetchStudents} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                    <RefreshCw className="w-4 h-4 text-gray-500" />
                  </button>
                </div>
              </div>

              {filteredStudents.length === 0 ? (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl">
                  <Users2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-semibold">No students found</p>
                  <p className="text-sm mt-1">{studentSearch ? 'Try different search terms' : 'Add your first student to get started!'}</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        {['Name', 'Email', 'Roll No.', 'Phone', 'Course', 'Batch', 'Actions'].map(h => (
                          <th key={h} className="text-left p-4 font-semibold text-gray-700 border-b border-gray-200">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((s, i) => (
                        <tr key={s._id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                          <td className="p-4 font-medium text-gray-900">{s.name}</td>
                          <td className="p-4 text-gray-600 max-w-[200px] truncate">{s.email}</td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-mono font-semibold">
                              {s.rollNumber || '—'}
                            </span>
                          </td>
                          <td className="p-4 text-gray-600">{s.phone || '—'}</td>
                          <td className="p-4 text-gray-600 max-w-[160px] truncate">{s.courseName || s.course?.title || '—'}</td>
                          <td className="p-4 text-gray-600">{s.batch || '—'}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => { setViewStudent(s); setViewStudentModal(true); }} 
                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-all hover:scale-105" title="View">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => openEdit(s)} 
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all hover:scale-105" title="Edit">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteStudent(s._id)} 
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all hover:scale-105" title="Delete">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  <Link key={path} to={path} className={`flex flex-col items-center gap-2 p-4 ${color} rounded-xl hover:scale-105 transition-transform group`}>
                    <Icon className="w-6 h-6 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-semibold text-center">{label}</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-orange-600" />
                <h2 className="font-black text-gray-900">Notifications</h2>
              </div>
              {notifications.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-4">No notifications</p>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {notifications.slice(0, 5).map(n => (
                    <div key={n._id} className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                      <div className="text-xs font-bold text-gray-800">{n.title}</div>
                      <div className="text-xs text-gray-600 mt-0.5 line-clamp-2">{n.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Support */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
              <h3 className="font-black text-xl mb-3">Need Support?</h3>
              <p className="text-green-200 text-sm mb-4">Contact KCI Head Office</p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex items-center gap-2"><PhoneIcon className="w-4 h-4" /> 9936384736</div>
                <div className="flex items-center gap-2"><PhoneIcon className="w-4 h-4" /> 9919660880</div>
              </div>
              <a href="https://wa.me/919936384736" target="_blank" rel="noreferrer"
                className="block text-center py-3 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all">
                💬 WhatsApp Support
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ADD STUDENT MODAL */}
      {addStudentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setAddStudentModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-white font-black text-xl">➕ Add New Student</h2>
                <p className="text-blue-100 text-sm">Roll & credentials auto-generated</p>
              </div>
              <button onClick={() => setAddStudentModal(false)}><X className="w-6 h-6 text-white/80 hover:text-white" /></button>
            </div>
            <form onSubmit={handleAddStudent} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
                    <User className="w-4 h-4" /> Full Name <span className="text-red-500">*</span>
                  </label>
                  <input 
                    value={studentForm.name} 
                    onChange={e => setStudentFormField('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                    placeholder="Enter student name"
                  />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
                    <PhoneIcon className="w-4 h-4" /> Phone
                  </label>
                  <input 
                    type="tel"
                    value={studentForm.phone} 
                    onChange={e => setStudentFormField('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                    placeholder="10 digit phone"
                  />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
                  <BookOpen className="w-4 h-4" /> Course <span className="text-red-500">*</span>
                </label>
                <select 
                  value={studentForm.courseName}
                  onChange={e => setStudentFormField('courseName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">-- Select Course --</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2">
                  <CalendarDays className="w-4 h-4" /> Batch
                </label>
                <input 
                  value={studentForm.batch} 
                  onChange={e => setStudentFormField('batch', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all" 
                  placeholder="e.g. 2024-A1"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">Student Photo (optional)</label>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={e => setStudentFormField('photo', e.target.files[0])} 
                  />
                  {studentForm.photo ? (
                    <span className="text-sm text-blue-600 font-medium truncate max-w-full px-2">{studentForm.photo.name}</span>
                  ) : (
                    <>
                      <ImagePlus className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-xs text-gray-500">Click to upload photo</span>
                    </>
                  )}
                </label>
              </div>
              <button 
                type="submit" 
                disabled={savingStudent}
                className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-60"
              >
                {savingStudent ? (
                  <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Adding...</>
                ) : (
                  <><Plus className="w-5 h-5" /> Add Student</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* EDIT STUDENT MODAL */}
      {editStudentModal && editStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditStudentModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-white font-black text-xl">✏️ Edit Student</h2>
                <p className="text-emerald-100 text-sm font-mono">{editStudent.rollNumber}</p>
              </div>
              <button onClick={() => setEditStudentModal(false)}><X className="w-6 h-6 text-white/80 hover:text-white" /></button>
            </div>
            <form onSubmit={handleEditStudent} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2"><User className="w-4 h-4" /> Name</label>
                  <input value={studentForm.name} onChange={e => setStudentFormField('name', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2"><PhoneIcon className="w-4 h-4" /> Phone</label>
                  <input type="tel" value={studentForm.phone} onChange={e => setStudentFormField('phone', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2"><BookOpen className="w-4 h-4" /> Course</label>
                <select value={studentForm.courseName} onChange={e => setStudentFormField('courseName', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white">
                  <option value="">-- Select Course --</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 mb-2"><CalendarDays className="w-4 h-4" /> Batch</label>
                <input value={studentForm.batch} onChange={e => setStudentFormField('batch', e.target.value)} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-2">Update Photo (optional)</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl hover:border-emerald-400 cursor-pointer">
                  <input type="file" accept="image/*" className="hidden" onChange={e => setStudentFormField('photo', e.target.files[0])} />
                  {studentForm.photo ? <span className="text-sm text-emerald-600">{studentForm.photo.name}</span> : <ImagePlus className="w-6 h-6 text-gray-400" />}
                </label>
              </div>
              <button type="submit" disabled={savingStudent} className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-2xl font-semibold flex items-center gap-2 hover:from-emerald-700">
                {savingStudent ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Pencil className="w-5 h-5" />}
                {savingStudent ? 'Saving...' : 'Update Student'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* VIEW STUDENT MODAL */}
      {viewStudentModal && viewStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setViewStudentModal(false)}>
          <div className="bg-white rounded-3xl w-full max-w-sm max-h-[85vh] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 flex items-center justify-between">
              <h2 className="text-white font-black text-lg">👤 Student Profile</h2>
              <button onClick={() => setViewStudentModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-center mb-4">
                {viewStudent.photo ? (
                  <img src={`http://localhost:5000${viewStudent.photo}`} alt={viewStudent.name} 
                    className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 shadow-lg cursor-pointer hover:scale-105 transition-all"
                    onClick={() => setImgPreview(`http://localhost:5000${viewStudent.photo}`)}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center shadow-lg">
                    <span className="text-3xl font-black text-indigo-600">{viewStudent.name[0].toUpperCase()}</span>
                  </div>
                )}
              </div>
              {[
                ['Roll Number', viewStudent.rollNumber || '—', 'font-mono bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full'],
                ['Full Name', viewStudent.name, 'font-semibold text-lg'],
                ['Email', viewStudent.email || '—'],
                ['Phone', viewStudent.phone || '—'],
                ['Course', viewStudent.courseName || viewStudent.course?.title || '—'],
                ['Batch', viewStudent.batch || '—'],
                ['Franchise', viewStudent.franchiseCenter || '—'],
                ['Status', viewStudent.isActive ? '🟢 Active' : '🔴 Inactive'],
                ['Joined', new Date(viewStudent.createdAt).toLocaleDateString('en-IN')],
              ].map(([label, value, className = '']) => (
                <div key={label} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-xl">
                  <span className="text-sm text-gray-600 font-medium">{label}</span>
                  <span className={`text-sm font-semibold ${className}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Preview */}
      {imgPreview && (
        <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4" onClick={() => setImgPreview(null)}>
          <img src={imgPreview} alt="Student photo" className="max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl object-contain cursor-zoom-out" />
        </div>
      )}

    </div>
  );
}

