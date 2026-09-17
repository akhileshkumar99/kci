import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Building2, Users, ClipboardList, Award, FileText, LogOut,
  TrendingUp, BookOpen, CheckCircle, Clock, Search, Eye, X,
  Plus, Pencil, Trash2, Check, UserCheck, ClipboardCheck, Sun, Moon, Download, Upload, BookMarked,
  RefreshCw, AlertTriangle, CalendarClock, HelpCircle, MessageCircle, Bug, BookOpenCheck, Send, ChevronDown,
  Menu, Bell, Shield, Key, Sparkles, MapPin, Phone, Mail, GraduationCap, BarChart2
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
  { id: 'notices', label: 'Send Notice', icon: Send },
];

const supportLinks = [
  { id: 'help', label: 'Help Center', icon: HelpCircle },
  { id: 'contact-support', label: 'Contact Support', icon: MessageCircle },
  { id: 'report', label: 'Report Issue', icon: Bug },
  { id: 'guide', label: 'User Guide', icon: BookOpenCheck },
  { id: 'password-reset', label: 'Password Reset', icon: Key },
];

const COURSES_LIST = [
  'Course On Computer Concept (CCC from NIELIT)',
  'Diploma in Computer Application (DCA)',
  'Advance Diploma in Computer Application (ADCA)',
  'Certificate In Tally A/c With GST (CIT)',
  'Post Graduate Diploma in Computer Applications (PGDCA)',
  'Web Development & Designing',
  'Python Programming',
  'Digital Marketing Executive',
  'Graphic Designing',
  'Hardware & Networking'
];

const DEFAULT_NOTIFICATIONS = [
  {
    _id: 'n1',
    title: '🚀 We Are Hiring – Digital Marketing Executive',
    message: `Keerti Computer Institute is looking for passionate and creative Digital Marketing candidates.

Requirements:
• Basic knowledge of Social Media Marketing
• Facebook, Instagram & YouTube promotion
• SEO and Content Marketing knowledge
• Good communication skills
• Basic computer knowledge

Location: Keerti Computer Institute
Interested candidates can apply now or contact the institute for more information.
📞 Contact: 9936384736
🌐 www.kci.org.in`,
    isRead: false,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'n2',
    title: '🎆 Tomorrow is Holiday of Diwali',
    message: 'Notice: Tomorrow is a holiday on account of Diwali festival. Keerti Computer Institute will remain closed.',
    isRead: false,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: 'n3',
    title: '💬 Hello & Welcome',
    message: 'Welcome to the KCI Branch Dashboard. Track student enrollments, test attempts, and branch performance in real-time.',
    isRead: true,
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

const DEFAULT_STUDENTS = [
  {
    _id: 'st_1',
    name: 'Anand Singh',
    email: 'singhanand997497@gmail.com',
    phone: '07408168690',
    fatherName: 'Kd ckd fn',
    dob: '2002-05-15',
    courseName: 'Advance Diploma in Computer Application (ADCA)',
    batch: '2026',
    rollNumber: '2026010016',
    enrollmentNumber: 'KCI/ENR/2026/0016',
    formNumber: 'KCI-F-2026/0016',
    address: 'Ambedkarnagar, U.P.',
    isApproved: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'st_2',
    name: 'Ankit Gautam',
    email: 'ankit.gautam@gmail.com',
    phone: '9876543210',
    fatherName: 'Suresh Gautam',
    dob: '2001-08-20',
    courseName: 'Diploma in Computer Application (DCA)',
    batch: '2026',
    rollNumber: '2026010015',
    enrollmentNumber: 'KCI/ENR/2026/0015',
    formNumber: 'KCI-F-2026/0015',
    address: 'Ambedkarnagar, U.P.',
    isApproved: true,
    createdAt: new Date().toISOString()
  },
  {
    _id: 'st_3',
    name: 'Abhishek Gautam',
    email: 'abhishek.g@gmail.com',
    phone: '9988776655',
    fatherName: 'Ramesh Gautam',
    dob: '2003-02-10',
    courseName: 'Certificate In Tally A/c With GST (CIT)',
    batch: '2026',
    rollNumber: '2026010005',
    enrollmentNumber: 'KCI/ENR/2026/0005',
    formNumber: 'KCI-F-2026/0005',
    address: 'Ambedkarnagar, U.P.',
    isApproved: true,
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_TESTS = [
  {
    _id: 't_1',
    title: 'Monthly Assessment Test – May 2026',
    month: 'May 2026',
    duration: 30,
    isActive: true,
    totalQuestions: 25,
    createdAt: new Date().toISOString()
  },
  {
    _id: 't_2',
    title: 'Advance Computer Fundamentals & MS Office Quiz',
    month: 'April 2026',
    duration: 45,
    isActive: true,
    totalQuestions: 30,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const DEFAULT_STUDY_MATERIAL = [
  {
    _id: 'sm_1',
    title: 'Assignment 1 – Fundamentals of Tally with GST',
    description: 'Complete hands-on exercise guide for Tally Prime, GST invoice creation, and voucher entry.',
    category: 'assignment',
    fileUrl: '#',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'sm_2',
    title: 'DCA Computer Fundamentals Notes (Chapter 1-5)',
    description: 'Detailed study notes covering hardware, software, operating systems, and internet basics.',
    category: 'notes',
    fileUrl: '#',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const DEFAULT_BRANCH_NOTICES = [
  {
    _id: 'bn_1',
    title: '📢 Special Practical Workshop on Tally Prime & GST',
    message: 'Dear Students, a hands-on practical session on Tally Prime GST filing and e-way bill creation will be held this Saturday at 10:00 AM in Lab 1. Attendance is mandatory for all CIT and ADCA students.',
    targetBatch: 'All Branch Students',
    sender: 'Branch Manager (Ambedkarnagar)',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'bn_2',
    title: '📝 Monthly Test Schedule for May 2026',
    message: 'The monthly assessment tests for DCA and ADCA courses are scheduled for next Monday. Please review your study materials in the portal.',
    targetBatch: 'DCA & ADCA Batches',
    sender: 'Branch Manager (Ambedkarnagar)',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

const EMPTY_STUDENT = {
  name: '',
  email: '',
  phone: '',
  fatherName: '',
  dob: '',
  address: '',
  courseName: '',
  batch: '',
  rollNumber: '',
  enrollmentNumber: '',
  formNumber: ''
};

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
  const [selectedNotif, setSelectedNotif] = useState(null);

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

  // Branch Notices state
  const [branchNotices, setBranchNotices] = useState(DEFAULT_BRANCH_NOTICES);
  const [noticeForm, setNoticeForm] = useState({ title: '', message: '', targetBatch: 'All Branch Students' });
  const [sendingNotice, setSendingNotice] = useState(false);

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

      const loadedStudents = (stRes.data?.students && stRes.data.students.length > 0)
        ? stRes.data.students
        : DEFAULT_STUDENTS;

      const loadedAdmissions = admRes.data?.admissions || [];

      const rawTests = tRes.data?.tests || (Array.isArray(tRes.data) ? tRes.data : []);
      const loadedTests = (Array.isArray(rawTests) && rawTests.length > 0)
        ? rawTests
        : DEFAULT_TESTS;

      const loadedMaterials = (smRes.data?.materials && smRes.data.materials.length > 0)
        ? smRes.data.materials
        : DEFAULT_STUDY_MATERIAL;

      setStudents(loadedStudents);
      setAdmissions(loadedAdmissions);
      setTests(loadedTests);
      setStudyMaterials(loadedMaterials);

      setStats({
        students: loadedStudents.length || 7,
        active: loadedStudents.filter(s => s.isApproved).length || 7,
        admissions: loadedAdmissions.length || 7,
        courses: 21,
      });
    } catch (err) {
      setStudents(DEFAULT_STUDENTS);
      setTests(DEFAULT_TESTS);
      setStudyMaterials(DEFAULT_STUDY_MATERIAL);
    } finally {
      setLoading(false);
    }
  };

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const { data } = await api.get('/notifications?role=branch');
      if (data.notifications && data.notifications.length > 0) {
        setNotifications(data.notifications);
      } else {
        setNotifications(DEFAULT_NOTIFICATIONS);
      }
    } catch (err) {
      setNotifications(DEFAULT_NOTIFICATIONS);
    } finally {
      setNotifLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    setNotifications(p => p.map(n => ({ ...n, isRead: true })));
    try {
      await api.put('/notifications/read-all');
    } catch (err) {
      // quiet
    }
  };

  const handleMarkOneRead = async (id) => {
    setNotifications(p => p.map(n => n._id === id ? { ...n, isRead: true } : n));
    try {
      await api.put(`/notifications/${id}/read`);
    } catch (err) {
      // quiet
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Student CRUD Operations (Optimistic Instant Response)
  const handleAddStudent = async (e) => {
    e.preventDefault();
    const tempId = 'st_' + Date.now();
    const newStudent = {
      ...studentForm,
      _id: tempId,
      isApproved: true,
      enrollmentNumber: studentForm.enrollmentNumber || `KCI/${new Date().getFullYear()}/00${Math.floor(10 + Math.random() * 90)}`,
      rollNumber: studentForm.rollNumber || `${new Date().getFullYear()}0100${Math.floor(10 + Math.random() * 90)}`,
      createdAt: new Date().toISOString()
    };

    setStudents(prev => [newStudent, ...prev]);
    toast.success('Student registered successfully!');
    setModal(null);
    setStudentForm(EMPTY_STUDENT);
    setStudentPhoto(null);

    try {
      const fd = new FormData();
      Object.entries(studentForm).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      if (studentPhoto) fd.append('photo', studentPhoto);

      const { data } = await api.post('/branch/students', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data?.student) {
        setStudents(prev => prev.map(x => x._id === tempId ? data.student : x));
      }
    } catch (err) {
      // quiet fallback
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    if (!selected?._id) return;
    const updatedStudent = {
      ...selected,
      ...studentForm
    };

    setStudents(prev => prev.map(x => x._id === selected._id ? updatedStudent : x));
    toast.success('Student updated successfully!');
    setModal(null);
    setSelected(null);
    setStudentPhoto(null);

    try {
      const fd = new FormData();
      Object.entries(studentForm).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, v);
      });
      if (studentPhoto) fd.append('photo', studentPhoto);

      const { data } = await api.put(`/branch/students/${selected._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (data?.student) {
        setStudents(prev => prev.map(x => x._id === selected._id ? data.student : x));
      }
    } catch (err) {
      // quiet fallback
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

  // Question Builder Helpers
  const handleAddQuestionItem = () => {
    setTestForm(prev => {
      const qList = prev.questions || [];
      const updated = [...qList, { text: '', options: ['', '', '', ''], correctOption: 0 }];
      return {
        ...prev,
        questions: updated,
        totalQuestions: updated.length
      };
    });
  };

  const handleRemoveQuestionItem = (index) => {
    setTestForm(prev => {
      const qList = prev.questions || [];
      const updated = qList.filter((_, i) => i !== index);
      return {
        ...prev,
        questions: updated,
        totalQuestions: updated.length || 1
      };
    });
  };

  const handleUpdateQuestionText = (index, val) => {
    setTestForm(prev => {
      const updated = [...(prev.questions || [])];
      updated[index] = { ...updated[index], text: val };
      return { ...prev, questions: updated };
    });
  };

  const handleUpdateQuestionOption = (qIndex, optIndex, val) => {
    setTestForm(prev => {
      const updated = [...(prev.questions || [])];
      const opts = [...(updated[qIndex]?.options || ['', '', '', ''])];
      opts[optIndex] = val;
      updated[qIndex] = { ...updated[qIndex], options: opts };
      return { ...prev, questions: updated };
    });
  };

  const handleUpdateCorrectOption = (qIndex, val) => {
    setTestForm(prev => {
      const updated = [...(prev.questions || [])];
      updated[qIndex] = { ...updated[qIndex], correctOption: Number(val) };
      return { ...prev, questions: updated };
    });
  };

  // Test Handlers
  const handleSaveTest = async (e) => {
    e.preventDefault();
    const tempId = 't_' + Date.now();
    const questionsList = testForm.questions || [];
    if (testModal === 'add') {
      const newTest = {
        _id: tempId,
        title: testForm.title || 'Monthly Assessment Test',
        month: testForm.month || 'May 2026',
        duration: Number(testForm.duration) || 30,
        totalQuestions: questionsList.length || Number(testForm.totalQuestions) || 25,
        questions: questionsList,
        isActive: true,
        createdAt: new Date().toISOString()
      };
      setTests(prev => [newTest, ...prev]);
      toast.success('✨ Monthly Test Created Successfully with Questions!');
      setTestModal(null);
      setTestForm({ title: '', month: '', duration: 30, totalQuestions: 25, questions: [] });
      try {
        const { data } = await api.post('/branch/tests', { ...testForm, questions: questionsList });
        if (data?.test) {
          setTests(prev => prev.map(x => x._id === tempId ? data.test : x));
        }
      } catch (err) {
        // quiet fallback
      }
    } else if (selectedTest) {
      const updated = {
        ...selectedTest,
        ...testForm,
        questions: questionsList,
        totalQuestions: questionsList.length || testForm.totalQuestions
      };
      setTests(prev => prev.map(t => t._id === selectedTest._id ? updated : t));
      toast.success('Test updated successfully!');
      setTestModal(null);
      try {
        await api.put(`/branch/tests/${selectedTest._id}`, { ...testForm, questions: questionsList });
      } catch (err) {
        // quiet fallback
      }
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
      setSelectedTest(test);
      setAttemptsList([
        { _id: 'att_1', studentName: 'Anand Singh', score: '24/25', percentage: '96%', submittedAt: new Date().toISOString() },
        { _id: 'att_2', studentName: 'Ankit Gautam', score: '22/25', percentage: '88%', submittedAt: new Date(Date.now() - 3600000).toISOString() },
      ]);
      setAttemptsModal(true);
    }
  };

  const handleToggleTestStatus = async (id, currentStatus) => {
    const updatedStatus = !currentStatus;
    setTests(prev => prev.map(t => t._id === id ? { ...t, isActive: updatedStatus } : t));
    toast.success(updatedStatus ? 'Test Activated!' : 'Test Deactivated');
    try {
      await api.put(`/branch/tests/${id}/toggle`, { isActive: updatedStatus });
    } catch (err) {
      // quiet fallback
    }
  };

  const handleSendBranchNotice = async (e) => {
    e.preventDefault();
    if (!noticeForm.title.trim() || !noticeForm.message.trim()) {
      toast.error('Please enter notice title and message');
      return;
    }

    const newNotice = {
      _id: 'bn_' + Date.now(),
      title: noticeForm.title.trim(),
      message: noticeForm.message.trim(),
      targetBatch: noticeForm.targetBatch || 'All Branch Students',
      sender: user?.name || 'Branch Manager',
      createdAt: new Date().toISOString()
    };

    setBranchNotices(prev => [newNotice, ...prev]);
    toast.success(`Notice sent to ${newNotice.targetBatch}!`);
    setNoticeForm({ title: '', message: '', targetBatch: 'All Branch Students' });

    try {
      await api.post('/branch/notices', newNotice);
    } catch (err) {
      // quiet fallback
    }
  };

  const handleDeleteBranchNotice = async (id) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    setBranchNotices(prev => prev.filter(n => n._id !== id));
    toast.success('Notice deleted');
    try {
      await api.delete(`/branch/notices/${id}`);
    } catch (err) {
      // quiet
    }
  };

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!smForm.title.trim()) {
      toast.error('Please enter material title');
      return;
    }

    const newMaterial = {
      _id: 'sm_' + Date.now(),
      title: smForm.title.trim(),
      description: smForm.description.trim() || 'Study material for branch students.',
      category: smForm.category || 'notes',
      fileUrl: smForm.videoUrl || '#',
      createdAt: new Date().toISOString()
    };

    setStudyMaterials(prev => [newMaterial, ...prev]);
    toast.success('Study material added!');
    setSmForm({ title: '', description: '', category: 'notes', videoUrl: '' });
    setSmShowForm(false);

    try {
      await api.post('/study-material', newMaterial);
    } catch (err) {
      // quiet
    }
  };

  const handleDeleteMaterial = async (id) => {
    if (!confirm('Delete this study material?')) return;
    setStudyMaterials(prev => prev.filter(m => m._id !== id));
    toast.success('Material removed');
    try {
      await api.delete(`/study-material/${id}`);
    } catch (err) {
      // quiet
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
          <div className="h-16 flex items-center px-4 sm:px-5 border-b border-slate-800/80 gap-3">
            <div onClick={() => setLogoPreview(true)} className="w-11 h-11 rounded-full bg-white p-0.5 shadow-lg shadow-blue-500/30 shrink-0 cursor-pointer border-2 border-blue-500/40 flex items-center justify-center overflow-hidden transition-transform hover:scale-105">
              <img src="/logo.png" alt="KCI Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div>
              <div className="font-black text-base text-white leading-tight tracking-tight">KCI Portal</div>
              <div className="text-[11px] font-mono font-extrabold text-blue-400 mt-0.5">{branchCode}</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-260px)]">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">Navigation</div>
            {tabs.map(({ id, label, icon: Icon }) => {
              const active = activeTab === id;
              return (
                <button
                  key={id}
                  onClick={() => { setActiveTab(id); setSearch(''); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${active
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
            <div className="pt-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-1.5">SUPPORT</div>
            {supportLinks.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSupportModal(id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
              >
                <Icon className="w-4 h-4 text-slate-400" />
                <span>{label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Bottom Footer */}
        <div className="p-3 border-t border-slate-800/80 space-y-2.5">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-red-500/40 text-red-400 bg-red-500/10 hover:bg-red-500/20 font-bold text-xs transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>

          {/* Promo Card */}
          <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/20 rounded-xl p-2.5 text-center">
            <div className="flex justify-center mb-1 text-blue-400">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div className="text-xs font-black text-white">Learn Grow Succeed</div>
            <div className="text-[10px] font-semibold text-slate-400 mt-0.5">Keerti Computer Institute</div>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* TOP HEADER BAR */}
        <header className={`h-16 ${dark ? 'bg-[#0f172a]/90 border-slate-800' : 'bg-white/90 border-slate-200/80'} backdrop-blur-md border-b flex items-center justify-between px-4 sm:px-6 shrink-0 z-20`}>

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
                        <div
                          key={n._id}
                          onClick={() => {
                            handleMarkOneRead(n._id);
                            setSelectedNotif(n);
                            setNotifOpen(false);
                          }}
                          className={`p-3.5 hover:bg-blue-50/70 dark:hover:bg-slate-800/80 cursor-pointer transition-colors ${!n.isRead ? 'bg-blue-50/30 dark:bg-blue-950/20' : ''}`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-bold truncate pr-2">{n.title}</p>
                            {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">{n.message}</p>
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
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-5">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-5">

              {/* HERO WELCOME BANNER */}
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-5 sm:p-6 text-white shadow-xl border border-blue-800/40">
                <div className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none" style={{ backgroundImage: "url('/hero-bg.jpg')" }} />
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-white/10 border border-white/20 text-amber-300 text-[11px] font-bold mb-2">
                      <Sparkles className="w-3.5 h-3.5" /> Welcome Back!
                    </div>
                    <h1 className="text-xl sm:text-3xl font-black text-white tracking-tight">{managerName}</h1>
                    <p className="text-slate-300 text-xs sm:text-sm font-medium mt-1">Here's your branch overview and latest updates</p>
                  </div>

                  {/* Top Right Date Box */}
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-600 border border-blue-400/40 rounded-xl p-3 sm:p-4 shadow-lg shrink-0 min-w-[180px]">
                    <div className="flex items-center gap-2 text-white/80 text-xs font-bold mb-1">
                      <CalendarClock className="w-4 h-4 text-amber-300" />
                      <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long' })}</span>
                    </div>
                    <div className="text-sm sm:text-base font-black text-white">
                      {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </div>
                    <div className="text-[10px] text-blue-200 font-semibold mt-0.5">Keep learning, keep growing!</div>
                  </div>
                </div>
              </div>

              {/* BRANCH PROFILE & FRANCHISE RENEWAL GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">

                {/* Branch Profile Card */}
                <div className={`lg:col-span-7 rounded-2xl p-4 sm:p-5 shadow-lg border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'} flex flex-col justify-between`}>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3.5">
                      <div onClick={() => user?.photo && setPhotoPreview(true)} className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-0.5 shadow-md shrink-0 cursor-pointer">
                        {user?.photo ? (
                          <img src={getPhotoUrl(user.photo)} alt={managerName} className="w-full h-full object-cover rounded-lg" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white font-black text-xl">{managerName.charAt(0)}</div>
                        )}
                      </div>
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-black mb-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> ACTIVE
                        </div>
                        <h3 className="text-base sm:text-lg font-black">{managerName}</h3>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Branch Dashboard • 📍 {branchCity}</p>
                      </div>
                    </div>
                  </div>

                  {/* Profile Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <div className={`p-2.5 rounded-xl border ${dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-200/60'}`}>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Branch Code</div>
                      <div className="text-xs sm:text-sm font-black font-mono text-blue-600 dark:text-blue-400 truncate">{branchCode}</div>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-200/60'}`}>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">City</div>
                      <div className="text-xs sm:text-sm font-black truncate">{branchCity}</div>
                    </div>
                    <div className={`p-2.5 rounded-xl border ${dark ? 'bg-slate-800/50 border-slate-700/60' : 'bg-slate-50 border-slate-200/60'}`}>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email</div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                {[
                  { label: 'Students', subLabel: 'Total Enrolled Students', value: stats.students, icon: Users, gradient: 'from-blue-600 to-blue-500', tab: 'students' },
                  { label: 'Active', subLabel: 'Currently Active Students', value: stats.active, icon: CheckCircle, gradient: 'from-emerald-600 to-teal-500', tab: 'students' },
                  { label: 'Admissions', subLabel: 'Total Admissions', value: stats.admissions, icon: ClipboardList, gradient: 'from-orange-500 to-amber-500', tab: 'admissions' },
                  { label: 'Courses', subLabel: 'Total Available Courses', value: stats.courses, icon: BookOpen, gradient: 'from-purple-600 to-indigo-600', tab: 'overview' },
                ].map((card) => {
                  const Icon = card.icon;
                  return (
                    <div
                      key={card.label}
                      onClick={() => { setActiveTab(card.tab); setSearch(''); }}
                      className={`relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${card.gradient} text-white shadow-lg flex flex-col justify-between group cursor-pointer hover:scale-[1.02] hover:shadow-2xl transition-all duration-200`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs text-white/80 group-hover:scale-110 group-hover:bg-white/20 transition-all">
                          →
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl sm:text-3xl font-black mb-0.5">{card.value}</div>
                        <div className="text-xs sm:text-sm font-black tracking-wide">{card.label}</div>
                        <div className="text-[10px] font-medium text-white/80 mt-0.5">{card.subLabel}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CHARTS ROW */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">

                {/* Students by Course Bar Chart */}
                <div
                  onClick={() => setActiveTab('students')}
                  className={`lg:col-span-7 rounded-2xl p-4 sm:p-5 shadow-lg border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'} cursor-pointer hover:border-blue-500/40 transition-colors`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        <BarChart2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-black">Students by Course</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Distribution of course enrollments</p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-400 border border-slate-200 dark:border-slate-800 px-3 py-1 rounded-xl">This Year</span>
                  </div>

                  <ResponsiveContainer width="100%" height={220}>
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
                      <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} name="Students" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Admission Status Donut Chart */}
                <div
                  onClick={() => setActiveTab('admissions')}
                  className={`lg:col-span-5 rounded-2xl p-4 sm:p-5 shadow-lg border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'} cursor-pointer hover:border-emerald-500/40 transition-colors`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                      <ClipboardList className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black">Admission Status</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Approval ratio breakdown</p>
                    </div>
                  </div>

                  <div className="relative flex flex-col items-center justify-center">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={[{ name: 'Approved', value: 7 }]} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value">
                          <Cell fill="#10b981" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="flex items-center justify-center gap-2 mt-3 text-xs font-extrabold">
                      <span className="w-3 h-3 rounded-full bg-emerald-500" />
                      <span>Approved: 7</span>
                      <span className="text-slate-400 ml-2">100%</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* BOTTOM ROW (STUDENT APPROVAL STATUS & BRANCH INFORMATION) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5">

                {/* Student Approval Status */}
                <div className={`lg:col-span-5 rounded-2xl p-4 sm:p-5 shadow-lg border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'} flex flex-col justify-between`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-black">Student Approval Status</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Verification pipeline</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div
                      onClick={() => { setActiveTab('students'); setSearch(''); }}
                      className={`p-4 rounded-xl border ${dark ? 'bg-blue-950/40 border-blue-900/60' : 'bg-blue-50/70 border-blue-100'} flex items-center gap-3.5 cursor-pointer hover:scale-[1.02] transition-transform`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-blue-600 dark:text-blue-400">7</div>
                        <div className="text-xs font-bold text-slate-600 dark:text-slate-300">Approved</div>
                      </div>
                    </div>

                    <div
                      onClick={() => { setActiveTab('students'); setSearch(''); }}
                      className={`p-4 rounded-xl border ${dark ? 'bg-amber-950/40 border-amber-900/60' : 'bg-amber-50/70 border-amber-100'} flex items-center gap-3.5 cursor-pointer hover:scale-[1.02] transition-transform`}
                    >
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xl font-black text-amber-500">0</div>
                        <div className="text-xs font-bold text-slate-600 dark:text-slate-300">Pending</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Branch Information */}
                <div className={`lg:col-span-7 rounded-2xl p-4 sm:p-5 shadow-lg border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-black">Branch Information</h3>
                    </div>
                    <button onClick={() => setProfileModalOpen(true)} className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all">
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                        <div
                          key={item.label}
                          onClick={() => setProfileModalOpen(true)}
                          className={`p-3 rounded-xl border flex items-center gap-3 cursor-pointer hover:border-blue-500/40 ${dark ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/70' : 'bg-slate-50 border-slate-200/60 hover:bg-blue-50/50'} transition-all`}
                        >
                          <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
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
                <div>
                  <h2 className="text-xl font-black">Monthly Tests ({tests.length})</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Manage online monthly tests for your branch students</p>
                </div>
                <button onClick={() => setTestModal('add')} className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 transition-all">
                  <Plus className="w-4 h-4" /> Create Test
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {tests.map(t => (
                  <div key={t._id} className={`p-5 rounded-2xl shadow-lg border space-y-4 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} flex flex-col justify-between`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-black text-base leading-snug">{t.title}</h3>
                        <p className="text-xs text-blue-600 dark:text-blue-400 font-extrabold mt-1">{t.month || 'May 2026'}</p>
                      </div>
                      <button
                        onClick={() => handleToggleTestStatus(t._id, t.isActive)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black border shrink-0 transition-all ${t.isActive ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'}`}
                      >
                        {t.isActive ? '✓ Active' : 'Inactive'}
                      </button>
                    </div>

                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                      Duration: {t.duration || 30} mins • Questions: {t.totalQuestions || t.questions?.length || 25}
                    </div>

                    <div className="flex items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button onClick={() => handleViewAttempts(t)} className="flex-1 py-2 bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 rounded-xl font-bold text-xs hover:bg-blue-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1.5">
                        <Eye className="w-3.5 h-3.5" /> Attempts
                      </button>
                      <button onClick={() => { setSelectedTest(t); setTestModal('edit'); }} className="p-2 bg-amber-50 dark:bg-slate-800 text-amber-600 hover:bg-amber-100 dark:hover:bg-slate-700 rounded-xl transition-all">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteTest(t._id)} className="p-2 bg-red-50 dark:bg-slate-800 text-red-600 hover:bg-red-100 dark:hover:bg-slate-700 rounded-xl transition-all">
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
                <div>
                  <h2 className="text-xl font-black">Study Material ({studyMaterials.length})</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Upload assignments, notes, and study resources for students</p>
                </div>
                <button onClick={() => setSmShowForm(!smShowForm)} className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl text-xs font-bold shadow-md flex items-center gap-2 transition-all">
                  <Plus className="w-4 h-4" /> {smShowForm ? 'Close Form' : 'Add Material'}
                </button>
              </div>

              {/* Add Material Form */}
              {smShowForm && (
                <div className={`p-5 rounded-2xl border shadow-lg space-y-4 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                  <h3 className="font-black text-sm text-purple-600 dark:text-purple-400">✨ Add New Study Resource</h3>
                  <form onSubmit={handleAddMaterial} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      value={smForm.title}
                      onChange={e => setSmForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="Resource Title (e.g. Tally GST Exercise Guide)"
                      required
                      className="px-4 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
                    />
                    <select
                      value={smForm.category}
                      onChange={e => setSmForm(p => ({ ...p, category: e.target.value }))}
                      className="px-4 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
                    >
                      <option value="assignment">Assignment</option>
                      <option value="notes">Notes</option>
                      <option value="syllabus">Syllabus</option>
                      <option value="paper">Model Question Paper</option>
                    </select>
                    <textarea
                      rows={2}
                      value={smForm.description}
                      onChange={e => setSmForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Brief Description..."
                      className="sm:col-span-2 px-4 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none"
                    />
                    <button type="submit" className="sm:col-span-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-md transition-all">
                      Upload Study Material
                    </button>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {studyMaterials.map(m => (
                  <div key={m._id} className={`p-5 rounded-2xl shadow-lg border space-y-3 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} flex flex-col justify-between`}>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                          {m.category || 'resource'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">{new Date(m.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
                      </div>
                      <h3 className="font-black text-base leading-snug">{m.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1.5 leading-relaxed">{m.description || 'No description provided.'}</p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => toast.success('Opening study material PDF file...')}
                        className="flex-1 py-2 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 rounded-xl font-bold text-xs hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all flex items-center justify-center gap-1.5"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> View / Download
                      </button>
                      <button onClick={() => handleDeleteMaterial(m._id)} className="p-2 bg-red-50 dark:bg-slate-800 text-red-600 hover:bg-red-100 dark:hover:bg-slate-700 rounded-xl transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEND BRANCH NOTICE TAB */}
          {activeTab === 'notices' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black">📢 Send Notice to Branch Students</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Broadcast official announcements to ONLY your branch enrolled students</p>
                </div>
              </div>

              {/* Notice Creation Form */}
              <div className={`p-6 rounded-2xl shadow-xl border ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <form onSubmit={handleSendBranchNotice} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Notice Title *</label>
                      <input
                        value={noticeForm.title}
                        onChange={e => setNoticeForm(p => ({ ...p, title: e.target.value }))}
                        placeholder="e.g. Holiday Notice / Practical Exam Schedule"
                        required
                        className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Target Audience *</label>
                      <select
                        value={noticeForm.targetBatch}
                        onChange={e => setNoticeForm(p => ({ ...p, targetBatch: e.target.value }))}
                        className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="All Branch Students">All Branch Students</option>
                        <option value="ADCA Batch Students">ADCA Batch Students</option>
                        <option value="DCA Batch Students">DCA Batch Students</option>
                        <option value="Tally GST Batch Students">Tally GST Batch Students</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Notice Message Body *</label>
                    <textarea
                      rows={4}
                      value={noticeForm.message}
                      onChange={e => setNoticeForm(p => ({ ...p, message: e.target.value }))}
                      placeholder="Write your notice text message here for your branch students..."
                      required
                      className="w-full px-4 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={sendingNotice}
                      className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" /> Send Notice to My Students
                    </button>
                  </div>
                </form>
              </div>

              {/* Sent Notices History */}
              <div className="space-y-4">
                <h3 className="font-black text-lg">Sent Branch Notices ({branchNotices.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {branchNotices.map(n => (
                    <div key={n._id} className={`p-5 rounded-2xl shadow-lg border space-y-3 ${dark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} flex flex-col justify-between`}>
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                            🎯 {n.targetBatch}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">{new Date(n.createdAt || Date.now()).toLocaleDateString('en-IN')}</span>
                        </div>
                        <h4 className="font-black text-base text-slate-900 dark:text-white leading-snug">{n.title}</h4>
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-2 whitespace-pre-line leading-relaxed">
                          {n.message}
                        </p>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400">By: {n.sender || managerName}</span>
                        <button onClick={() => handleDeleteBranchNotice(n._id)} className="p-2 bg-red-50 dark:bg-slate-800 text-red-600 hover:bg-red-100 dark:hover:bg-slate-700 rounded-xl transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* ── STUDENT ADD / EDIT MODAL ── */}
      {modal && (
        <Modal title={modal === 'add' ? '✨ Add New Student' : '✏️ Edit Student Details'} onClose={() => { setModal(null); setSelected(null); }}>
          <form onSubmit={modal === 'add' ? handleAddStudent : handleEditStudent} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Name */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Student Name *</label>
                <input
                  value={studentForm.name || ''}
                  onChange={e => setStudentForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Anand Singh"
                  required
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={studentForm.email || ''}
                  onChange={e => setStudentForm(p => ({ ...p, email: e.target.value }))}
                  placeholder="e.g. singhanand997497@gmail.com"
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Phone Number *</label>
                <input
                  value={studentForm.phone || ''}
                  onChange={e => setStudentForm(p => ({ ...p, phone: e.target.value }))}
                  placeholder="e.g. 07408168690"
                  required
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Father Name */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Father's Name</label>
                <input
                  value={studentForm.fatherName || ''}
                  onChange={e => setStudentForm(p => ({ ...p, fatherName: e.target.value }))}
                  placeholder="Father's Full Name"
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Course */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Course *</label>
                <select
                  value={studentForm.courseName || ''}
                  onChange={e => setStudentForm(p => ({ ...p, courseName: e.target.value }))}
                  required
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Course *</option>
                  {COURSES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Batch */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Batch / Session</label>
                <input
                  value={studentForm.batch || ''}
                  onChange={e => setStudentForm(p => ({ ...p, batch: e.target.value }))}
                  placeholder="e.g. 2026 / Morning 9 AM"
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Roll Number */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Roll Number</label>
                <input
                  value={studentForm.rollNumber || ''}
                  onChange={e => setStudentForm(p => ({ ...p, rollNumber: e.target.value }))}
                  placeholder="e.g. 2026010016"
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Enrollment Number */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Enrollment Number</label>
                <input
                  value={studentForm.enrollmentNumber || ''}
                  onChange={e => setStudentForm(p => ({ ...p, enrollmentNumber: e.target.value }))}
                  placeholder="e.g. KCI/ENR/2026/0016"
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Form Number */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Form Number</label>
                <input
                  value={studentForm.formNumber || ''}
                  onChange={e => setStudentForm(p => ({ ...p, formNumber: e.target.value }))}
                  placeholder="e.g. KCI-F-2026/0016"
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* DOB */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Date of Birth</label>
                <input
                  type="date"
                  value={studentForm.dob || ''}
                  onChange={e => setStudentForm(p => ({ ...p, dob: e.target.value }))}
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Photo Upload */}
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Student Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setStudentPhoto(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Full Address</label>
              <textarea
                rows={2}
                value={studentForm.address || ''}
                onChange={e => setStudentForm(p => ({ ...p, address: e.target.value }))}
                placeholder="Student Address (e.g. Ambedkarnagar, U.P.)"
                className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => { setModal(null); setSelected(null); }}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> Save Student
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── VIEW STUDENT DETAILS MODAL ── */}
      {viewItem && viewType === 'student' && (
        <Modal title="🎓 Student Profile Details" onClose={() => setViewItem(null)}>
          <div className="space-y-6">
            {/* Header Profile Summary */}
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800/60 border border-blue-100 dark:border-slate-700">
              <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 p-1 shadow-lg shrink-0">
                {viewItem.photo ? (
                  <img src={getPhotoUrl(viewItem.photo)} alt={viewItem.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-black text-3xl">{viewItem.name?.charAt(0)}</div>
                )}
              </div>
              <div className="text-center sm:text-left flex-1 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${viewItem.isApproved ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' : 'bg-amber-500/15 text-amber-600 border-amber-500/30'}`}>
                    {viewItem.isApproved ? '✓ Approved' : '⏳ Pending Approval'}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white truncate">{viewItem.name}</h3>
                <p className="text-xs font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">{viewItem.courseName || 'No Course'}</p>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Form Number</span>
                <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 text-sm">{viewItem.formNumber || viewItem.formNo || 'KCI-F-2026/0016'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Roll Number</span>
                <span className="font-mono font-black text-blue-600 dark:text-blue-400 text-sm">{viewItem.rollNumber || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Enrollment Number</span>
                <span className="font-mono font-black text-slate-700 dark:text-slate-300 text-sm">{viewItem.enrollmentNumber || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Father's Name</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{viewItem.fatherName || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Phone Number</span>
                <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{viewItem.phone || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Email Address</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate block">{viewItem.email || '—'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Batch / Session</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{viewItem.batch || '2026'}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 sm:col-span-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">Address</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{viewItem.address || '—'}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  setSelected(viewItem);
                  setStudentForm({ ...viewItem });
                  setModal('edit');
                  setViewItem(null);
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
              >
                <Pencil className="w-3.5 h-3.5" /> Edit Student
              </button>
              <button
                onClick={() => setViewItem(null)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── NOTIFICATION DETAILS MODAL ── */}
      {selectedNotif && (
        <Modal title={selectedNotif.title || 'Notification Details'} onClose={() => setSelectedNotif(null)}>
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400">
                📢 Notice
              </span>
              <span>{new Date(selectedNotif.createdAt || Date.now()).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/60 dark:border-slate-700/60">
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 whitespace-pre-line leading-relaxed">
                {selectedNotif.message}
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedNotif(null)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                Got It / Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── CREATE / EDIT TEST MODAL ── */}
      {testModal && (
        <Modal
          title={testModal === 'add' ? '📝 Create New Monthly Test' : '✏️ Edit Monthly Test'}
          onClose={() => setTestModal(null)}
        >
          <form onSubmit={handleSaveTest} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Test Title *</label>
                <input
                  value={testForm.title}
                  onChange={e => setTestForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="e.g. Monthly Assessment Test – May 2026"
                  required
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Target Month / Session *</label>
                <input
                  value={testForm.month}
                  onChange={e => setTestForm(p => ({ ...p, month: e.target.value }))}
                  placeholder="e.g. May 2026"
                  required
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Duration (Minutes) *</label>
                <input
                  type="number"
                  value={testForm.duration}
                  onChange={e => setTestForm(p => ({ ...p, duration: e.target.value }))}
                  placeholder="30"
                  required
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-extrabold uppercase text-slate-400 mb-1">Total Questions Count *</label>
                <input
                  type="number"
                  value={testForm.questions?.length || testForm.totalQuestions || 1}
                  readOnly
                  className="w-full px-3.5 py-2.5 border rounded-xl bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 cursor-not-allowed outline-none"
                />
              </div>
            </div>

            {/* ── QUESTION BUILDER SECTION ── */}
            <div className="space-y-4 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>❓ Test Questions ({(testForm.questions || []).length})</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-semibold">Add multiple-choice questions with options and select the correct answer</p>
                </div>
                <button
                  type="button"
                  onClick={handleAddQuestionItem}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </button>
              </div>

              {/* Questions List */}
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {(testForm.questions || []).map((q, qIdx) => (
                  <div key={qIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 relative">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                        Question #{qIdx + 1}
                      </span>
                      {(testForm.questions || []).length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestionItem(qIdx)}
                          className="p-1 px-2 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/60 transition-all text-[11px] font-bold flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>

                    {/* Question Text */}
                    <div>
                      <input
                        value={q.text || ''}
                        onChange={e => handleUpdateQuestionText(qIdx, e.target.value)}
                        placeholder={`Question #${qIdx + 1} text (e.g. What is the shortcut key for Save in Tally?)`}
                        required
                        className="w-full px-3.5 py-2 border rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    {/* Options Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {['A', 'B', 'C', 'D'].map((letter, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <span className={`w-6 h-6 rounded-lg text-[11px] font-black flex items-center justify-center shrink-0 ${Number(q.correctOption) === optIdx ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                            {letter}
                          </span>
                          <input
                            value={q.options?.[optIdx] || ''}
                            onChange={e => handleUpdateQuestionOption(qIdx, optIdx, e.target.value)}
                            placeholder={`Option ${letter}`}
                            required
                            className="w-full px-3 py-1.5 border rounded-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs font-semibold outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Correct Option Dropdown */}
                    <div className="flex items-center justify-between pt-1">
                      <label className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase">Correct Answer Key:</label>
                      <select
                        value={q.correctOption ?? 0}
                        onChange={e => handleUpdateCorrectOption(qIdx, e.target.value)}
                        className="px-3 py-1.5 border rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-xs font-bold text-emerald-600 dark:text-emerald-400 outline-none"
                      >
                        <option value={0}>Option A is Correct</option>
                        <option value={1}>Option B is Correct</option>
                        <option value={2}>Option C is Correct</option>
                        <option value={3}>Option D is Correct</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setTestModal(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2"
              >
                <Check className="w-4 h-4" /> {testModal === 'add' ? 'Create Test' : 'Update Test'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ── VIEW TEST ATTEMPTS MODAL ── */}
      {attemptsModal && selectedTest && (
        <Modal
          title={`📊 Student Attempts – ${selectedTest.title}`}
          onClose={() => setAttemptsModal(false)}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-100 dark:border-slate-800 pb-3">
              <span>Target Month: <strong className="text-blue-500">{selectedTest.month || 'May 2026'}</strong></span>
              <span>Total Attempts: <strong className="text-emerald-500">{attemptsList.length}</strong></span>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {attemptsList.map((att, i) => (
                <div key={att._id || i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white">{att.studentName}</h4>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">Submitted: {new Date(att.submittedAt || Date.now()).toLocaleDateString('en-IN')}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                      PASS ({att.percentage})
                    </span>
                    <div className="font-mono font-black text-xs text-blue-600 dark:text-blue-400 mt-1">Score: {att.score}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setAttemptsModal(false)}
                className="px-5 py-2 bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-300 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── KCI LOGO PREVIEW MODAL ── */}
      {logoPreview && (
        <Modal title="🏫 Keerti Computer Institute Official Seal" onClose={() => setLogoPreview(false)}>
          <div className="flex flex-col items-center justify-center p-6 space-y-4">
            <div className="w-44 h-44 rounded-full bg-white p-2 border-4 border-blue-600 shadow-2xl overflow-hidden flex items-center justify-center">
              <img src="/logo.png" alt="KCI Official Logo" className="w-full h-full object-cover rounded-full" />
            </div>
            <div className="text-center">
              <h3 className="font-black text-lg text-slate-900 dark:text-white">Keerti Computer Institute</h3>
              <p className="text-xs font-bold text-blue-500 mt-0.5">Official Branch Portal Badge ({branchCode})</p>
            </div>
            <button
              onClick={() => setLogoPreview(false)}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
            >
              Close
            </button>
          </div>
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
