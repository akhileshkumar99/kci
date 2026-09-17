import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Building2, Users, ClipboardList, Award, FileText, LogOut,
  TrendingUp, BookOpen, CheckCircle, Clock, Search, Eye, X,
  Plus, Pencil, Trash2, Check, UserCheck, ClipboardCheck, Sun, Moon, Download, Upload, BookMarked,
  RefreshCw, AlertTriangle, CalendarClock, HelpCircle, MessageCircle, Bug, BookOpenCheck, Send, ChevronDown,
  Menu, Bell, Shield, Key, Sparkles, MapPin, Phone, Mail, GraduationCap
} from 'lucide-react';
import * as XLSX from 'xlsx';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const tabs = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'admissions', label: 'Admissions', icon: ClipboardList },
  { id: 'tests', label: 'Monthly Tests', icon: ClipboardCheck },
  { id: 'studymaterial', label: 'Study Material', icon: BookMarked },
];

const supportLinks = [
  { id: 'help', label: 'Help Center', icon: HelpCircle },
  { id: 'contact-support', label: 'Contact Support', icon: MessageCircle },
  { id: 'report', label: 'Report Issue', icon: Bug },
  { id: 'guide', label: 'User Guide', icon: BookOpenCheck },
  { id: 'password-reset', label: 'Password Reset', icon: Key },
];

const EMPTY_STUDENT = { name: '', email: '', phone: '', fatherName: '', dob: '', address: '', courseName: '', batch: '' };

function RenewalCountdown({ renewalDate, approvedAt }) {
  const [timeLeft, setTimeLeft] = useState({ days: 267, hours: 21, mins: 28, secs: 31, total: 267 * 86400000 });

  const effectiveRenewal = renewalDate || (approvedAt
    ? new Date(new Date(approvedAt).setFullYear(new Date(approvedAt).getFullYear() + 1)).toISOString()
    : '2027-06-12T00:00:00.000Z');

  const effectiveStart = approvedAt ? new Date(approvedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '12 Jun 2026';
  const effectiveDue = effectiveRenewal ? new Date(effectiveRenewal).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '12 Jun 2027';

  useEffect(() => {
    const calc = () => {
      const target = effectiveRenewal ? new Date(effectiveRenewal) : new Date(Date.now() + 267 * 86400000);
      const diff = target - new Date();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0, total: 0 });
        return;
      }
      setTimeLeft({
        total: diff,
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        mins: Math.floor((diff % 3600000) / 60000),
        secs: Math.floor((diff % 60000) / 1000),
      });
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [effectiveRenewal]);

  return (
    <div className="bg-[#0b1736] text-white rounded-3xl p-5 shadow-xl border border-blue-900/60 relative overflow-hidden flex flex-col justify-between h-full">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Card Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <RefreshCw className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-sm sm:text-base text-white tracking-wide">Franchise Renewal</span>
        </div>
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-black rounded-full uppercase tracking-wider">
          ACTIVE
        </span>
      </div>

      {/* Countdown Grid Blocks */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 my-2">
        {[
          { val: timeLeft.days, unit: 'Days' },
          { val: timeLeft.hours, unit: 'Hrs' },
          { val: timeLeft.mins, unit: 'Min' },
          { val: timeLeft.secs, unit: 'Sec' },
        ].map((item) => (
          <div key={item.unit} className="bg-[#14234b] border border-blue-800/40 rounded-2xl p-2 sm:p-3 text-center shadow-inner">
            <div className="text-xl sm:text-2xl font-black text-white leading-tight">
              {String(item.val).padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs font-semibold text-blue-300/80 mt-0.5">{item.unit}</div>
          </div>
        ))}
      </div>

      {/* Progress Bar & Footer Dates */}
      <div className="mt-4 pt-3 border-t border-blue-900/50">
        <div className="w-full h-1.5 bg-blue-950 rounded-full overflow-hidden mb-2.5">
          <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full w-[75%]" />
        </div>
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <span>From: {effectiveStart}</span>
          <span>Due: {effectiveDue}</span>
        </div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 dark:border-slate-800 dark:text-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-800">
          <h2 className="text-lg font-black text-gray-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4 text-gray-500 dark:text-slate-400" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

const COURSES = [
  { name: 'Certificate In Fundamental (CIF)', duration: '3 Months', fee: '₹2,500', subjects: ['Computer Basics', 'MS Paint', 'Notepad', 'Typing Basics'], eligibility: '8th Pass', certificate: 'CIF Certificate', description: 'Computer ki basic knowledge ke liye best course.', jobs: ['Data Entry', 'Office Assistant'] },
  { name: 'Certificate in Computer Application (CCA)', duration: '6 Months', fee: '₹4,000', subjects: ['Computer Fundamentals', 'MS Office', 'Internet'], eligibility: '10th Pass', certificate: 'CCA Certificate', description: 'Office work ke liye comprehensive course.', jobs: ['Office Executive', 'Data Entry Operator'] },
  { name: 'Certificate In Office Package & Tally A/C (COPT)', duration: '6 Months', fee: '₹4,500', subjects: ['MS Office', 'Tally', 'Practical'], eligibility: '10th Pass', certificate: 'COPT Certificate', description: 'Office package aur Tally accounting course.', jobs: ['Accountant', 'Office Executive'] },
  { name: 'Tally Specialist Course With GST', duration: '3 Months', fee: '₹3,500', subjects: ['Tally Prime', 'GST Filing', 'Accounts'], eligibility: '10th Pass', certificate: 'Tally Certificate', description: 'Tally Prime aur GST filing course.', jobs: ['Accountant', 'GST Consultant'] },
  { name: 'Advance Diploma in Computer Application (ADCA)', duration: '12 Months', fee: '₹8,000', subjects: ['DCA Full', 'Tally', 'DTP', 'Web Design', 'C/C++'], eligibility: '10th Pass', certificate: 'ADCA Diploma', description: 'Most popular 1-year computer diploma.', jobs: ['Computer Teacher', 'Web Designer', 'Accountant'] },
];

export default function BranchDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Dark mode theme state (persisted)
  const [dark, setDark] = useState(() => localStorage.getItem('kci_dark') === 'true');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ students: 7, active: 7, admissions: 7, courses: 21 });
  const [students, setStudents] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [tests, setTests] = useState([]);
  const [studyMaterials, setStudyMaterials] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  const [viewType, setViewType] = useState(null);

  const [studentForm, setStudentForm] = useState(EMPTY_STUDENT);
  const [studentPhoto, setStudentPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(false);
  const [logoPreview, setLogoPreview] = useState(false);

  // Support modals & notifications dropdowns
  const [supportModal, setSupportModal] = useState(null);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [supportForm, setSupportForm] = useState({ name: user?.name || '', email: user?.email || '', message: '' });

  // Tests & Study material state
  const [testModal, setTestModal] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testForm, setTestForm] = useState({ title: '', month: '', duration: 30, questions: [{ text: '', options: ['', '', '', ''], correctOption: 0 }] });
  const [attemptsModal, setAttemptsModal] = useState(false);
  const [attemptsList, setAttemptsList] = useState([]);
  const [smShowForm, setSmShowForm] = useState(false);
  const [smForm, setSmForm] = useState({ title: '', description: '', category: 'notes', videoUrl: '' });
  const [smThumbnail, setSmThumbnail] = useState(null);
  const [smThumbPreview, setSmThumbPreview] = useState(null);
  const [smPdfFile, setSmPdfFile] = useState(null);
  const [smLoading, setSmLoading] = useState(false);

  const importRef = useRef();
  const notifRef = useRef();
  const profileRef = useRef();

  useEffect(() => {
    localStorage.setItem('kci_dark', dark);
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    if (!user || user.role !== 'branch') {
      navigate('/login');
      return;
    }
    loadData();
    loadNotifications();
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [stRes, admRes, tRes, smRes, statsRes] = await Promise.all([
        api.get('/branch/students').catch(() => ({ data: { students: [] } })),
        api.get('/branch/admissions').catch(() => ({ data: { admissions: [] } })),
        api.get('/branch/tests').catch(() => ({ data: { tests: [] } })),
        api.get('/study-material').catch(() => ({ data: { materials: [] } })),
        api.get('/branch/stats').catch(() => ({ data: { stats: {} } })),
      ]);

      const loadedStudents = stRes.data.students || [];
      const loadedAdmissions = admRes.data.admissions || [];

      setStudents(loadedStudents);
      setAdmissions(loadedAdmissions);
      setTests(tRes.data.tests || []);
      setStudyMaterials(smRes.data.materials || []);

      setStats({
        students: loadedStudents.length || 7,
        active: loadedStudents.filter(s => s.isApproved).length || 7,
        admissions: loadedAdmissions.length || 7,
        courses: 21,
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const { data } = await api.get('/notifications?role=branch');
      setNotifications(data.notifications || []);
    } catch (err) {
      // quiet catch
    } finally {
      setNotifLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(p => p.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      // quiet
    }
  };

  const handleMarkOneRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(p => p.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      // quiet
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Student CRUD Operations
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(studentForm).forEach(([k, v]) => fd.append(k, v));
      if (studentPhoto) fd.append('photo', studentPhoto);

      const { data } = await api.post('/branch/students', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStudents(p => [data.student, ...p]);
      toast.success('Student registered successfully!');
      setModal(null);
      setStudentForm(EMPTY_STUDENT);
      setStudentPhoto(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add student');
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(studentForm).forEach(([k, v]) => fd.append(k, v));
      if (studentPhoto) fd.append('photo', studentPhoto);

      const { data } = await api.put(`/branch/students/${selected._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStudents(p => p.map(x => x._id === selected._id ? data.student : x));
      toast.success('Student updated!');
      setModal(null);
      setSelected(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update student');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!confirm('Are you sure you want to delete this student?')) return;
    try {
      await api.delete(`/branch/students/${id}`);
      setStudents(p => p.filter(x => x._id !== id));
      toast.success('Student removed!');
    } catch (err) {
      toast.error('Failed to delete student');
    }
  };

  const handleApproveStudent = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.put(`/branch/students/${id}/approve`, { isApproved: newStatus });
      setStudents(p => p.map(x => x._id === id ? { ...x, isApproved: newStatus } : x));
      toast.success(newStatus ? 'Student Approved!' : 'Approval status updated.');
    } catch (err) {
      toast.error('Failed to update approval status');
    }
  };

  // Admission Handlers
  const handleApproveAdmission = async (id) => {
    try {
      await api.put(`/branch/admissions/${id}/approve`);
      setAdmissions(p => p.map(a => a._id === id ? { ...a, status: 'Approved' } : a));
      toast.success('Admission approved!');
    } catch (err) {
      toast.error('Failed to approve admission');
    }
  };

  const handleRejectAdmission = async (id) => {
    try {
      await api.put(`/branch/admissions/${id}/reject`);
      setAdmissions(p => p.map(a => a._id === id ? { ...a, status: 'Rejected' } : a));
      toast.success('Admission rejected');
    } catch (err) {
      toast.error('Failed to reject admission');
    }
  };

  // Test Handlers
  const handleSaveTest = async (e) => {
    e.preventDefault();
    try {
      if (testModal === 'add') {
        const { data } = await api.post('/branch/tests', testForm);
        setTests(p => [data.test, ...p]);
        toast.success('Test created!');
      } else {
        const { data } = await api.put(`/branch/tests/${selectedTest._id}`, testForm);
        setTests(p => p.map(t => t._id === selectedTest._id ? data.test : t));
        toast.success('Test updated!');
      }
      setTestModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save test');
    }
  };

  const handleDeleteTest = async (id) => {
    if (!confirm('Delete this test?')) return;
    try {
      await api.delete(`/branch/tests/${id}`);
      setTests(p => p.filter(t => t._id !== id));
      toast.success('Test deleted');
    } catch (err) {
      toast.error('Failed to delete test');
    }
  };

  const handleViewAttempts = async (test) => {
    try {
      const { data } = await api.get(`/branch/tests/${test._id}/attempts`);
      setAttemptsList(data.attempts || []);
      setSelectedTest(test);
      setAttemptsModal(true);
    } catch (err) {
      toast.error('Failed to fetch attempts');
    }
  };

  // Excel Operations
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(students.map(s => ({
      'Enrollment No': s.enrollmentNumber || '',
      'Roll No': s.rollNumber || '',
      'Name': s.name || '',
      'Father Name': s.fatherName || '',
      'Course': s.courseName || '',
      'Batch': s.batch || '',
      'Phone': s.phone || '',
      'Email': s.email || '',
      'Status': s.isApproved ? 'Approved' : 'Pending',
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.utils.writeFile(wb, `${user?.branchCode || 'Branch'}_Students.xlsx`);
  };

  const importExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const data = XLSX.utils.sheet_to_json(ws);

        const { data: resData } = await api.post('/branch/students/import', { students: data });
        toast.success(`Imported ${resData.count || data.length} students!`);
        loadData();
      } catch (err) {
        toast.error('Failed to import Excel file');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Filtering Helper
  const filtered = (list, keys) => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(item => keys.some(k => String(item[k] || '').toLowerCase().includes(q)));
  };

  const getPhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    return photoPath.startsWith('http') ? photoPath : `${import.meta.env.VITE_API_URL || ''}${photoPath}`;
  };

  const branchName = user?.branchName || 'Ambedkarnagar';
  const branchCode = user?.branchCode || 'KCI-B-025';
  const managerName = user?.name || 'Mahendra Pandey';
  const branchCity = user?.branchCity || 'Ambedkarnagar';
  const branchEmail = user?.email || 'fullstackgenius1@gmail.com';
  const branchPhone = user?.phone || '9919660880';
  const branchAddress = user?.branchAddress || user?.address || 'Ambedkarnagar, U.P.';

  return (
    <div className={`flex h-screen ${dark ? 'bg-[#0b1329] text-white' : 'bg-[#f8fafc] text-slate-900'} overflow-hidden font-sans`}>
      
      {/* ── SIDEBAR ── */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 ${dark ? 'bg-[#080e1e] border-slate-800' : 'bg-[#0a1329] border-slate-800'} text-white border-r flex flex-col justify-between transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Logo Brand Header */}
          <div className="h-20 flex items-center px-6 border-b border-slate-800/80 gap-3">
            <div onClick={() => setLogoPreview(true)} className="w-10 h-10 rounded-2xl bg-white p-1.5 shadow-lg shadow-blue-500/20 shrink-0 cursor-pointer">
              <img src="/logo.png" alt="KCI" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="font-black text-lg text-white leading-tight tracking-tight">KCI Portal</div>
              <div className="text-xs font-mono font-bold text-blue-400">{branchCode}</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-280px)]">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">Navigation</div>
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setSearch(''); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 ${
                    active
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                  <span>{label}</span>
                </button>
              );
            })}

            {/* Support Section Links */}
            <div className="pt-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">SUPPORT</div>
            {supportLinks.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSupportModal(id)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Bottom Footer */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-2xl border border-red-500/40 text-red-400 bg-red-500/10 hover:bg-red-500/20 font-bold text-xs transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>

          {/* Promo Card */}
          <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-2xl p-3 text-center">
            <div className="flex justify-center mb-1 text-blue-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div className="text-xs font-black text-white">Learn Grow Succeed</div>
            <div className="text-[10px] font-semibold text-slate-400 mt-0.5">Keerti Computer Institute</div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* TOP HEADER BAR */}
        <header className={`h-20 ${dark ? 'bg-[#0f172a]/90 border-slate-800' : 'bg-white/90 border-slate-200/80'} backdrop-blur-md border-b flex items-center justify-between px-4 sm:px-8 shrink-0 z-20`}>
          
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              <Menu className="w-5 h-5" />
            </button>

            {/* Search Input */}
            <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border ${dark ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-100/70 border-slate-200'} max-w-xs w-64 sm:w-80`}>
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="bg-transparent text-xs sm:text-sm font-semibold outline-none w-full placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={() => setDark(!dark)}
              className={`p-2.5 rounded-2xl border transition-all ${dark ? 'bg-slate-800 border-slate-700 text-yellow-400' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-blue-600'}`}
              title="Toggle Light/Dark Theme"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotifOpen(!notifOpen); setProfileDropdown(false); }}
                className={`relative p-2.5 rounded-2xl border transition-all ${dark ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-blue-600'}`}
              >
                <Bell className="w-4 h-4" />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 text-white rounded-full text-[9px] font-black flex items-center justify-center animate-pulse">
                    {notifications.filter(n => !n.isRead).length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className={`absolute right-0 mt-3 w-80 rounded-3xl shadow-2xl border z-50 overflow-hidden ${dark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                      <span className="font-black text-xs sm:text-sm">Notifications</span>
                      <button onClick={handleMarkAllRead} className="text-xs font-bold text-blue-600 hover:underline">Mark all read</button>
                    </div>
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400 font-semibold">No notifications yet</div>
                      ) : notifications.map(n => (
                        <div key={n._id} onClick={() => handleMarkOneRead(n._id)} className="p-3.5 hover:bg-blue-50/50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                          <p className="text-xs font-bold">{n.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile Pill Header */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileDropdown(!profileDropdown); setNotifOpen(false); }}
                className={`flex items-center gap-3 px-3 py-1.5 rounded-2xl border transition-all ${dark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100/80 border-slate-200'}`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md shrink-0">
                  {user?.photo ? (
                    <img src={getPhotoUrl(user.photo)} alt={managerName} className="w-full h-full object-cover" />
                  ) : (
                    managerName.charAt(0)
                  )}
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-black leading-tight">{managerName}</div>
                  <div className="text-[10px] font-semibold text-slate-400">Branch - {branchCity}</div>
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* ── DASHBOARD BODY AREA ── */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-8">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              
              {/* HERO WELCOME BANNER */}
              <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 sm:p-8 text-white shadow-2xl border border-blue-800/40">
                <div className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('/hero-bg.jpg')" }} />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-amber-300 text-xs font-bold mb-3">
                      <Sparkles className="w-3.5 h-3.5" /> Welcome Back!
                    </div>
                    <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">{managerName}</h1>
                    <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1.5">Here's your branch overview and latest updates</p>
                  </div>

                  {/* Top Right Date Box */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/40 rounded-2xl p-4 shadow-xl shrink-0 min-w-[200px]">
                    <div className="flex items-center gap-2 text-white/80 text-xs font-bold mb-1">
                      <CalendarClock className="w-4 h-4 text-amber-300" />
                      <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long' })}</span>
                    </div>
                    <div className="text-base sm:text-lg font-black text-white">
                      {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-[10px] text-blue-200 font-semibold mt-1">Keep learning, keep growing!</div>
                  </div>
                </div>
              </div>

              {/* BRANCH PROFILE & FRANCHISE RENEWAL GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Branch Profile Card */}
                <div className={`lg:col-span-7 rounded-3xl p-6 shadow-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'} flex flex-col justify-between`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                      <div onClick={() => user?.photo && setPhotoPreview(true)} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-1 shadow-lg shrink-0 cursor-pointer">
                        {user?.photo ? (
                          <img src={getPhotoUrl(user.photo)} alt={managerName} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-black text-2xl">{managerName.charAt(0)}</div>
                        )}
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black mb-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ACTIVE
                        </div>
                        <h3 className="text-lg sm:text-xl font-black">{managerName}</h3>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Branch Dashboard • 📍 {branchCity}</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className={`p-3 rounded-2xl border ${dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-200/60'}`}>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Branch Code</div>
                      <div className="text-xs sm:text-sm font-black font-mono text-blue-600 dark:text-blue-400 truncate">{branchCode}</div>
                    </div>
                    <div className={`p-3 rounded-2xl border ${dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-200/60'}`}>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">City</div>
                      <div className="text-xs sm:text-sm font-black truncate">{branchCity}</div>
                    </div>
                    <div className={`p-3 rounded-2xl border ${dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-200/60'}`}>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email</div>
                      <div className="text-xs font-black truncate">{branchEmail}</div>
                    </div>
                  </div>
                </div>

                {/* Franchise Renewal Card */}
                <div className="lg:col-span-5">
                  <RenewalCountdown renewalDate={user?.renewalDate} approvedAt={user?.approvedAt} />
                </div>
              </div>

              {/* STATISTICS KPI CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                  { label: 'Students', subLabel: 'Total Enrolled Students', value: stats.students, icon: Users, gradient: 'from-blue-600 to-blue-500' },
                  { label: 'Active', subLabel: 'Currently Active Students', value: stats.active, icon: CheckCircle, gradient: 'from-emerald-600 to-teal-500' },
                  { label: 'Admissions', subLabel: 'Total Admissions', value: stats.admissions, icon: ClipboardList, gradient: 'from-orange-500 to-amber-500' },
                  { label: 'Courses', subLabel: 'Total Available Courses', value: stats.courses, icon: BookOpen, gradient: 'from-purple-600 to-indigo-600' },
                ].map((card) => {
                  const Icon = card.icon;
                  return (
                    <div key={card.label} className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${card.gradient} text-white shadow-xl flex flex-col justify-between group`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/80 group-hover:scale-110 transition-transform">
                          →
                        </div>
                      </div>
                      <div>
                        <div className="text-3xl sm:text-4xl font-black mb-1">{card.value}</div>
                        <div className="text-sm font-black tracking-wide">{card.label}</div>
                        <div className="text-[11px] font-medium text-white/80 mt-0.5">{card.subLabel}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CHARTS ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Students by Course Bar Chart */}
                <div className={`lg:col-span-7 rounded-3xl p-6 shadow-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        📊
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-black">Students by Course</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Distribution of course enrollments</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-xl">This Year</span>
                  </div>

                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={[
                      { name: 'Course On Co', count: 1 },
                      { name: 'Diploma in C', count: 2 },
                      { name: 'Advance Dipl', count: 2 },
                      { name: 'Certificate', count: 2 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke={dark ? '#1e293b' : '#f1f5f9'} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 700, fill: dark ? '#94a3b8' : '#64748b' }} />
                      <YAxis tick={{ fontSize: 11, fill: dark ? '#94a3b8' : '#64748b' }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 16, background: dark ? '#0f172a' : '#ffffff', borderColor: dark ? '#334155' : '#e2e8f0', color: dark ? '#ffffff' : '#0f172a' }} />
                      <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Students" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Admission Status Donut Chart */}
                <div className={`lg:col-span-5 rounded-3xl p-6 shadow-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      📄
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black">Admission Status</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Approval ratio breakdown</p>
                    </div>
                  </div>

                  <div className="relative flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={[{ name: 'Approved', value: 7 }]} cx="50%" cy="50%" innerRadius={60} outerRadius={85} dataKey="value">
                          <Cell fill="#10b981" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs font-extrabold">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span>Approved: 7</span>
                      <span className="text-slate-400 ml-2">100%</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* BOTTOM ROW (STUDENT APPROVAL STATUS & BRANCH INFORMATION) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Student Approval Status */}
                <div className={`lg:col-span-5 rounded-3xl p-6 shadow-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'} flex flex-col justify-between`}>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      👤
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-black">Student Approval Status</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Verification pipeline</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={`p-5 rounded-2xl border ${dark ? 'bg-blue-950/40 border-blue-900/60' : 'bg-blue-50/70 border-blue-100'} flex items-center gap-4`}>
                      <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-md">
                        👤
                      </div>
                      <div>
                        <div className="text-2xl font-black text-blue-600 dark:text-blue-400">7</div>
                        <div className="text-xs font-bold text-slate-600 dark:text-slate-300">Approved</div>
                      </div>
                    </div>

                    <div className={`p-5 rounded-2xl border ${dark ? 'bg-amber-950/40 border-amber-900/60' : 'bg-amber-50/70 border-amber-100'} flex items-center gap-4`}>
                      <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                        ⏰
                      </div>
                      <div>
                        <div className="text-2xl font-black text-amber-500">0</div>
                        <div className="text-xs font-bold text-slate-600 dark:text-slate-300">Pending</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Branch Information */}
                <div className={`lg:col-span-7 rounded-3xl p-6 shadow-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                        🏫
                      </div>
                      <h3 className="text-base sm:text-lg font-black">Branch Information</h3>
                    </div>
                    <button onClick={() => setProfileModalOpen(true)} className="px-4 py-2 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all">
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { icon: Building2, label: 'Branch Name', val: branchName },
                      { icon: Shield, label: 'Branch Code', val: branchCode, mono: true },
                      { icon: MapPin, label: 'City', val: branchCity },
                      { icon: Phone, label: 'Phone', val: branchPhone },
                      { icon: Mail, label: 'Email', val: branchEmail },
                      { icon: FileText, label: 'Address', val: branchAddress },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className={`p-3.5 rounded-2xl border flex items-center gap-3.5 ${dark ? 'bg-slate-800/40 border-slate-700/60' : 'bg-slate-50 border-slate-200/60'}`}>
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.label}</div>
                            <div className={`text-xs sm:text-sm font-black truncate ${item.mono ? 'font-mono text-blue-600 dark:text-blue-400' : ''}`}>{item.val}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* STUDENTS TAB */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-black">Students ({students.length})</h2>
                <div className="flex flex-wrap items-center gap-3">
                  <input ref={importRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={importExcel} />
                  <button onClick={() => importRef.current.click()} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Import Excel
                  </button>
                  <button onClick={exportExcel} className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2">
                    <Download className="w-4 h-4" /> Export Excel
                  </button>
                  <button onClick={() => { setSelected(null); setModal('add'); }} className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Student
                  </button>
                </div>
              </div>

              {/* Students Table */}
              <div className={`rounded-3xl shadow-xl border overflow-hidden ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className={dark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}>
                      <tr>
                        {['Photo', 'Name', 'Enrollment', 'Roll No', 'Course', 'Status', 'Actions'].map(h => (
                          <th key={h} className="text-left px-5 py-4 font-black uppercase text-[11px] tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {filtered(students, ['name', 'enrollmentNumber', 'rollNumber', 'courseName']).map(s => (
                        <tr key={s._id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-200 shrink-0">
                              {s.photo ? (
                                <img src={getPhotoUrl(s.photo)} alt={s.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-bold text-slate-500">{s.name.charAt(0)}</div>
                              )}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 font-bold">{s.name}</td>
                          <td className="px-5 py-3.5 font-mono text-xs">{s.enrollmentNumber || '—'}</td>
                          <td className="px-5 py-3.5 font-mono text-xs text-blue-600 font-bold">{s.rollNumber || '—'}</td>
                          <td className="px-5 py-3.5 font-medium">{s.courseName || '—'}</td>
                          <td className="px-5 py-3.5">
                            <button onClick={() => handleApproveStudent(s._id, s.isApproved)} className={`px-3 py-1 rounded-full text-[11px] font-black border ${s.isApproved ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : 'bg-amber-500/15 text-amber-600 border-amber-500/30'}`}>
                              {s.isApproved ? '✓ Approved' : '⏳ Pending'}
                            </button>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <button onClick={() => { setViewItem(s); setViewType('student'); }} className="p-2 rounded-xl bg-blue-50 dark:bg-slate-800 text-blue-600 hover:bg-blue-100">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => { setSelected(s); setStudentForm({ ...s }); setModal('edit'); }} className="p-2 rounded-xl bg-amber-50 dark:bg-slate-800 text-amber-600 hover:bg-amber-100">
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteStudent(s._id)} className="p-2 rounded-xl bg-red-50 dark:bg-slate-800 text-red-600 hover:bg-red-100">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ADMISSIONS TAB */}
          {activeTab === 'admissions' && (
            <div className="space-y-6">
              <h2 className="text-xl font-black">Admissions ({admissions.length})</h2>
              <div className={`rounded-3xl shadow-xl border overflow-hidden ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm">
                    <thead className={dark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'}>
                      <tr>
                        {['Applicant', 'Course', 'Phone', 'Email', 'Status', 'Actions'].map(h => (
                          <th key={h} className="text-left px-5 py-4 font-black uppercase text-[11px] tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {admissions.map(a => (
                        <tr key={a._id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="px-5 py-3.5 font-bold">{a.fullName || a.name}</td>
                          <td className="px-5 py-3.5 font-medium">{a.courseName}</td>
                          <td className="px-5 py-3.5 font-mono">{a.phone}</td>
                          <td className="px-5 py-3.5">{a.email}</td>
                          <td className="px-5 py-3.5">
                            <span className={`px-3 py-1 rounded-full text-[11px] font-black border ${a.status === 'Approved' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : a.status === 'Rejected' ? 'bg-red-500/15 text-red-600 border-red-500/30' : 'bg-amber-500/15 text-amber-600 border-amber-500/30'}`}>
                              {a.status || 'Pending'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            {a.status !== 'Approved' && (
                              <button onClick={() => handleApproveAdmission(a._id)} className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700">
                                ✓ Approve
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MONTHLY TESTS TAB */}
          {activeTab === 'tests' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">Monthly Tests ({tests.length})</h2>
                <button onClick={() => setTestModal('add')} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Create Test
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {tests.map(t => (
                  <div key={t._id} className={`p-6 rounded-3xl shadow-xl border space-y-4 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-black text-base">{t.title}</h3>
                        <p className="text-xs text-blue-600 font-bold mt-0.5">{t.month || 'Monthly'}</p>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${t.isActive ? 'bg-emerald-500/15 text-emerald-600' : 'bg-slate-200 text-slate-500'}`}>
                        {t.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button onClick={() => handleViewAttempts(t)} className="flex-1 py-2 bg-blue-50 dark:bg-slate-800 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-100">
                        Attempts
                      </button>
                      <button onClick={() => handleDeleteTest(t._id)} className="p-2 bg-red-50 dark:bg-slate-800 text-red-600 rounded-xl hover:bg-red-100">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STUDY MATERIAL TAB */}
          {activeTab === 'studymaterial' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-black">Study Material ({studyMaterials.length})</h2>
                <button onClick={() => setSmShowForm(!smShowForm)} className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Add Material
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {studyMaterials.map(m => (
                  <div key={m._id} className={`p-5 rounded-3xl shadow-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                    <h3 className="font-black text-base mb-1">{m.title}</h3>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">{m.category}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </main>

      </div>

      {/* ── MODALS (Student Add/Edit, Support, Profile, Photo) ── */}
      {modal && (
        <Modal title={modal === 'add' ? 'Add Student' : 'Edit Student'} onClose={() => setModal(null)}>
          <form onSubmit={modal === 'add' ? handleAddStudent : handleEditStudent} className="space-y-4">
            <input value={studentForm.name} onChange={e => setStudentForm(p => ({ ...p, name: e.target.value }))} placeholder="Student Name *" required className="w-full px-4 py-2.5 border rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none" />
            <input value={studentForm.email} onChange={e => setStudentForm(p => ({ ...p, email: e.target.value }))} placeholder="Email" className="w-full px-4 py-2.5 border rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none" />
            <input value={studentForm.phone} onChange={e => setStudentForm(p => ({ ...p, phone: e.target.value }))} placeholder="Phone *" required className="w-full px-4 py-2.5 border rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none" />
            <select value={studentForm.courseName} onChange={e => setStudentForm(p => ({ ...p, courseName: e.target.value }))} required className="w-full px-4 py-2.5 border rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-bold outline-none">
              <option value="">Select Course *</option>
              {COURSES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
            <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-2xl text-xs hover:bg-blue-700">Submit</button>
          </form>
        </Modal>
      )}

      {/* SUPPORT MODALS */}
      {supportModal === 'help' && (
        <Modal title="❓ Help Center" onClose={() => setSupportModal(null)}>
          <div className="space-y-3 text-xs">
            <p className="font-bold">Frequently Asked Questions:</p>
            <p>• How to add student? Click Students tab → Add Student.</p>
            <p>• How to approve admission? Click Admissions tab → Approve.</p>
          </div>
        </Modal>
      )}

    </div>
  );
}
