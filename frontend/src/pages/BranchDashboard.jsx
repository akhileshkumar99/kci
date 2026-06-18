import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Building2, Users, ClipboardList, Award, FileText, LogOut,
  TrendingUp, BookOpen, CheckCircle, Clock, Search, Eye, X,
  Plus, Pencil, Trash2, Check, UserCheck, ClipboardCheck, Sun, Moon, Download, Upload
} from 'lucide-react';
import * as XLSX from 'xlsx';

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import DevCredit from '../components/DevCredit';

const tabs = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'admissions', label: 'Admissions', icon: ClipboardList },
  { id: 'results', label: 'Results', icon: Award },
  { id: 'certificates', label: 'Certificates', icon: FileText },
  { id: 'tests', label: 'Monthly Tests', icon: ClipboardCheck },
];

const EMPTY_STUDENT = { name: '', email: '', phone: '', fatherName: '', dob: '', address: '', courseName: '', batch: '' };
const EMPTY_RESULT = { rollNumber: '', studentName: '', courseName: '', batch: '', totalMarks: '', obtainedMarks: '', percentage: '', grade: '', status: 'Pass', examDate: '' };
const EMPTY_CERT = { rollNumber: '', studentName: '', courseName: '', certificateNumber: '', grade: '', issueDate: '' };

function StatCard({ icon: Icon, label, value, color, delay, onClick }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      onClick={onClick}
      className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4 ${onClick ? 'cursor-pointer hover:shadow-md hover:border-blue-200 transition-all hover:-translate-y-0.5' : ''}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-2xl font-black text-gray-900">{value ?? 0}</div>
        <div className="text-xs text-gray-500 font-medium">{label}</div>
      </div>
    </motion.div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

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

const getPhotoUrl = (photo) => {
  if (!photo) return null;
  if (photo.startsWith('http')) return photo;
  return `${import.meta.env.VITE_API_URL || ''}${photo}`;
};

function StudentForm({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial);
  const [showPass, setShowPass] = useState(false);
  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const [photoFile, setPhotoFile] = useState(null);
  const textFields = [
    { name: 'name', label: 'Full Name *', placeholder: 'Student full name', span2: true },
    { name: 'email', label: 'Email *', placeholder: 'student@email.com', type: 'email', span2: true },
    { name: 'phone', label: 'Phone', placeholder: '10-digit mobile' },
    { name: 'fatherName', label: "Father's Name", placeholder: "Father's full name" },
    { name: 'batch', label: 'Batch', placeholder: 'e.g. 2024-25' },
    { name: 'dob', label: 'Date of Birth', type: 'date' },
  ];
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form, photoFile); }} className="space-y-4">
      {/* Photo */}
      <div className="flex items-center gap-4">
        {(photoFile || initial.photo) ? (
          <img
            src={photoFile ? URL.createObjectURL(photoFile) : getPhotoUrl(initial.photo)}
            alt="" className="w-16 h-16 rounded-full object-cover border-2 border-blue-200 flex-shrink-0" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200 flex-shrink-0">
            <span className="text-xl font-bold text-blue-600">{(form.name || 'S')[0].toUpperCase()}</span>
          </div>
        )}
        <div className="flex-1">
          <label className="text-xs font-semibold text-gray-600 block mb-1">Student Photo</label>
          <label className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
            <input type="file" className="hidden" accept="image/*" onChange={e => setPhotoFile(e.target.files[0])} />
            <span className="text-xs text-gray-500">{photoFile ? photoFile.name : initial.photo ? 'Click to change photo' : 'Click to upload photo'}</span>
          </label>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {textFields.map(({ name, label, placeholder, type = 'text', span2 }) => (
          <div key={name} className={`space-y-1 ${span2 ? 'col-span-2' : ''}`}>
            <label className="text-xs font-semibold text-gray-600">{label}</label>
            <input name={name} type={type} value={form[name] || ''} onChange={set} placeholder={placeholder}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all" />
          </div>
        ))}
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">Course Name *</label>
        <select name="courseName" value={form.courseName || ''} onChange={set}
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all">
          <option value="">-- Select Course --</option>
          {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">Address</label>
        <textarea name="address" value={form.address || ''} onChange={set} rows={2} placeholder="Full address"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all resize-none" />
      </div>

      {/* Password Change — only shown for edit */}
      {initial._id && (
        <div className="border border-dashed border-orange-300 rounded-2xl p-4 space-y-3 bg-orange-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-orange-700">🔑 Change Password</span>
            <button type="button" onClick={() => { setShowPass(p => !p); setForm(p => ({ ...p, newPassword: '' })); }}
              className={`text-xs font-semibold px-3 py-1 rounded-lg transition-all ${
                showPass ? 'bg-orange-200 text-orange-800' : 'bg-orange-100 text-orange-600 hover:bg-orange-200'
              }`}>
              {showPass ? 'Cancel' : 'Set New Password'}
            </button>
          </div>
          {showPass && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">New Password</label>
              <input
                type="text"
                name="newPassword"
                value={form.newPassword || ''}
                onChange={set}
                placeholder="Enter new password"
                className="w-full px-3 py-2.5 border border-orange-300 rounded-xl text-sm focus:outline-none focus:border-orange-500 bg-white"
              />
              <p className="text-xs text-orange-500">Leave blank to keep current password.</p>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={saving}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2">
          {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {initial._id ? 'Save Changes' : 'Add Student'}
        </button>
      </div>
    </form>
  );
}

function ViewModal({ title, data, fields, onClose }) {
  const [imgPreview, setImgPreview] = useState(null);
  const format = (key, val) => {
    if (val === null || val === undefined || val === '') return '—';
    if (key === 'isApproved' || key === 'isActive') return val ? 'Approved ✓' : 'Pending';
    if (key === 'dob' || key === 'issueDate' || key === 'examDate') {
      const d = new Date(val);
      return isNaN(d) ? val : d.toLocaleDateString('en-IN');
    }
    return val.toString();
  };
  return (
    <Modal title={title} onClose={onClose}>
      {data.photo !== undefined && (
        <div className="flex justify-center mb-5">
          {data.photo ? (
            <img
              src={getPhotoUrl(data.photo)}
              alt={data.name}
              onClick={() => setImgPreview(getPhotoUrl(data.photo))}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-md cursor-pointer hover:opacity-90 hover:scale-105 transition-all"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-100 shadow-md">
              <span className="text-3xl font-black text-blue-600">{(data.name || 'S')[0].toUpperCase()}</span>
            </div>
          )}
        </div>
      )}
      {imgPreview && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4" onClick={() => setImgPreview(null)}>
          <img src={imgPreview} alt="Preview" className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain" />
          <button onClick={() => setImgPreview(null)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors">
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      )}
      <div className="space-y-2.5">
        {fields.map(([label, key]) => (
          <div key={key} className="flex justify-between items-start gap-4 py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs font-semibold text-gray-400 shrink-0 w-28">{label}</span>
            <span className="text-sm text-gray-800 font-medium text-right">{format(key, data[key])}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

// Per-course syllabus subjects with max marks
const COURSE_SUBJECTS = {
  'Diploma in Computer Application (DCA)': [
    { name: 'Computer Fundamentals', maxMarks: 100 },
    { name: 'MS Office', maxMarks: 100 },
    { name: 'Internet & Email', maxMarks: 100 },
    { name: 'Tally ERP', maxMarks: 100 },
    { name: 'Practical', maxMarks: 100 },
  ],
  'Advance Diploma in Computer Application (ADCA)': [
    { name: 'Computer Fundamentals', maxMarks: 100 },
    { name: 'MS Office Advanced', maxMarks: 100 },
    { name: 'Tally with GST', maxMarks: 100 },
    { name: 'DTP & Photoshop', maxMarks: 100 },
    { name: 'Programming Basics', maxMarks: 100 },
    { name: 'Practical', maxMarks: 100 },
  ],
  'Certificate in Computer Application (CCA)': [
    { name: 'Computer Basics', maxMarks: 100 },
    { name: 'MS Office', maxMarks: 100 },
    { name: 'Internet', maxMarks: 100 },
    { name: 'Practical', maxMarks: 100 },
  ],
  'Certificate In Fundamental (CIF)': [
    { name: 'Computer Fundamentals', maxMarks: 100 },
    { name: 'Typing', maxMarks: 100 },
    { name: 'Practical', maxMarks: 100 },
  ],
  'Tally Specialist Course With GST': [
    { name: 'Tally Prime', maxMarks: 100 },
    { name: 'GST Filing', maxMarks: 100 },
    { name: 'Accounts', maxMarks: 100 },
    { name: 'Practical', maxMarks: 100 },
  ],
  'Certificate In Tally A/c With GST (CIT)': [
    { name: 'Tally Basics', maxMarks: 100 },
    { name: 'GST', maxMarks: 100 },
    { name: 'Practical', maxMarks: 100 },
  ],
  'Certificate In Office Package & Tally A/C (COPT)': [
    { name: 'MS Word', maxMarks: 100 },
    { name: 'MS Excel', maxMarks: 100 },
    { name: 'MS PowerPoint', maxMarks: 100 },
    { name: 'Tally', maxMarks: 100 },
    { name: 'Practical', maxMarks: 100 },
  ],
  'Desktop Publishing (DTP)': [
    { name: 'PageMaker', maxMarks: 100 },
    { name: 'CorelDraw', maxMarks: 100 },
    { name: 'Photoshop', maxMarks: 100 },
    { name: 'Practical', maxMarks: 100 },
  ],
  'Computer Typing (Hindi + English)': [
    { name: 'Hindi Typing', maxMarks: 100 },
    { name: 'English Typing', maxMarks: 100 },
    { name: 'Speed Test', maxMarks: 100 },
  ],
  'Course On Computer Concept (CCC from NIELIT)': [
    { name: 'Theory', maxMarks: 100 },
    { name: 'Practical', maxMarks: 100 },
  ],
};

function getGrade(pct) {
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 33) return 'D';
  return 'F';
}

function ResultForm({ initial, students, onSave, onClose, saving }) {
  const isEdit = !!initial._id;
  const [form, setForm] = useState({
    rollNumber: initial.rollNumber || '',
    studentName: initial.studentName || '',
    courseName: initial.courseName || '',
    batch: initial.batch || '',
    totalMarks: initial.totalMarks || '',
    obtainedMarks: initial.obtainedMarks || '',
    percentage: initial.percentage || '',
    grade: initial.grade || '',
    status: initial.status || 'Pass',
    examDate: initial.examDate ? initial.examDate.slice(0, 10) : '',
  });
  const [subjects, setSubjects] = useState(() => {
    if (initial.subjects?.length) return initial.subjects;
    const subs = COURSE_SUBJECTS[initial.courseName] || [];
    return subs.map(s => ({ name: s.name, maxMarks: s.maxMarks, obtainedMarks: '' }));
  });

  // Auto-fill when roll number selected
  const handleRollChange = (rollNumber) => {
    const student = students.find(s => s.rollNumber === rollNumber);
    if (student) {
      const subs = COURSE_SUBJECTS[student.courseName] || [];
      setSubjects(subs.map(s => ({ name: s.name, maxMarks: s.maxMarks, obtainedMarks: '' })));
      setForm(p => ({
        ...p,
        rollNumber,
        studentName: student.name,
        courseName: student.courseName || '',
        batch: student.batch || '',
      }));
    } else {
      setForm(p => ({ ...p, rollNumber }));
    }
  };

  // Auto-fill subjects when course changes
  const handleCourseChange = (courseName) => {
    const subs = COURSE_SUBJECTS[courseName] || [];
    setSubjects(subs.map(s => ({ name: s.name, maxMarks: s.maxMarks, obtainedMarks: '' })));
    setForm(p => ({ ...p, courseName }));
  };

  // Recalculate totals when subject marks change
  const handleSubjectMark = (idx, val) => {
    const updated = subjects.map((s, i) => i === idx ? { ...s, obtainedMarks: val } : s);
    setSubjects(updated);
    const total = updated.reduce((a, s) => a + Number(s.maxMarks || 0), 0);
    const obtained = updated.reduce((a, s) => a + Number(s.obtainedMarks || 0), 0);
    const pct = total > 0 ? Math.round((obtained / total) * 100) : 0;
    setForm(p => ({
      ...p,
      totalMarks: total,
      obtainedMarks: obtained,
      percentage: pct,
      grade: getGrade(pct),
      status: pct >= 33 ? 'Pass' : 'Fail',
    }));
  };

  const addSubject = () => setSubjects(p => [...p, { name: '', maxMarks: 100, obtainedMarks: '' }]);
  const removeSubject = (idx) => {
    const updated = subjects.filter((_, i) => i !== idx);
    setSubjects(updated);
    const total = updated.reduce((a, s) => a + Number(s.maxMarks || 0), 0);
    const obtained = updated.reduce((a, s) => a + Number(s.obtainedMarks || 0), 0);
    const pct = total > 0 ? Math.round((obtained / total) * 100) : 0;
    setForm(p => ({ ...p, totalMarks: total, obtainedMarks: obtained, percentage: pct, grade: getGrade(pct), status: pct >= 33 ? 'Pass' : 'Fail' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, subjects });
  };

  const inp = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Roll Number selector */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">Enrollment Number *</label>
          <select value={form.rollNumber} onChange={e => handleRollChange(e.target.value)} className={inp}>
            <option value="">-- Select Student --</option>
            {students.map(s => (
              <option key={s._id} value={s.rollNumber}>{s.rollNumber} — {s.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">Student Name *</label>
          <input value={form.studentName} onChange={e => setForm(p => ({ ...p, studentName: e.target.value }))} placeholder="Auto-filled" className={inp} />
        </div>
        <div className="space-y-1 col-span-2">
          <label className="text-xs font-semibold text-gray-600">Course *</label>
          <select value={form.courseName} onChange={e => handleCourseChange(e.target.value)} className={inp}>
            <option value="">-- Select Course --</option>
            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">Batch</label>
          <input value={form.batch} onChange={e => setForm(p => ({ ...p, batch: e.target.value }))} placeholder="e.g. 2024-25" className={inp} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">Exam Date</label>
          <input type="date" value={form.examDate} onChange={e => setForm(p => ({ ...p, examDate: e.target.value }))} className={inp} />
        </div>
      </div>

      {/* Subjects / Syllabus */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-gray-600">📚 Subjects / Syllabus</label>
          <button type="button" onClick={addSubject} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold">
            <Plus className="w-3.5 h-3.5" /> Add Subject
          </button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {subjects.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-3 border-2 border-dashed border-gray-200 rounded-xl">No subjects. Select a course or add manually.</p>
          )}
          {subjects.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <input value={s.name} onChange={e => setSubjects(p => p.map((x, j) => j === i ? { ...x, name: e.target.value } : x))}
                placeholder="Subject name" className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-gray-50" />
              <input type="number" value={s.maxMarks} onChange={e => setSubjects(p => p.map((x, j) => j === i ? { ...x, maxMarks: e.target.value } : x))}
                placeholder="Max" className="w-16 px-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-gray-50 text-center" />
              <input type="number" value={s.obtainedMarks} onChange={e => handleSubjectMark(i, e.target.value)}
                placeholder="Got" className="w-16 px-2 py-2 border border-blue-200 rounded-xl text-xs focus:outline-none focus:border-blue-500 bg-blue-50 text-center" />
              <button type="button" onClick={() => removeSubject(i)} className="p-1.5 text-red-400 hover:text-red-600">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Auto-calculated summary */}
      <div className="grid grid-cols-4 gap-3 bg-gray-50 rounded-2xl p-4">
        {[['Total Marks', form.totalMarks], ['Obtained', form.obtainedMarks], ['Percentage', form.percentage ? form.percentage + '%' : ''], ['Grade', form.grade]].map(([l, v]) => (
          <div key={l} className="text-center">
            <div className="text-xs text-gray-400 font-medium">{l}</div>
            <div className="text-lg font-black text-gray-900">{v || '—'}</div>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="flex items-center gap-3">
        <label className="text-xs font-semibold text-gray-600">Status</label>
        {['Pass', 'Fail'].map(s => (
          <button key={s} type="button" onClick={() => setForm(p => ({ ...p, status: s }))}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              form.status === s
                ? s === 'Pass' ? 'bg-green-600 text-white' : 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}>{s}</button>
        ))}
      </div>

      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={saving}
          className="flex-1 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2">
          {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {isEdit ? 'Update Result' : 'Save Result'}
        </button>
      </div>
    </form>
  );
}

function CertForm({ initial, students, onSave, onClose, saving }) {
  const isEdit = !!initial._id;
  const [form, setForm] = useState({
    rollNumber: initial.rollNumber || '',
    studentName: initial.studentName || '',
    courseName: initial.courseName || '',
    certificateNumber: initial.certificateNumber || '',
    grade: initial.grade || '',
    issueDate: initial.issueDate ? initial.issueDate.slice(0, 10) : '',
  });
  const [loadingCertNo, setLoadingCertNo] = useState(false);

  const fetchNextCertNumber = async (courseName) => {
    if (!courseName || isEdit) return;
    setLoadingCertNo(true);
    try {
      const { data } = await api.get('/branch/certificates/next-number', { params: { courseName } });
      if (data.certNumber) setForm(p => ({ ...p, certificateNumber: data.certNumber }));
    } catch {}
    setLoadingCertNo(false);
  };

  const handleRollChange = (rollNumber) => {
    const student = students.find(s => s.rollNumber === rollNumber);
    if (student) {
      setForm(p => ({ ...p, rollNumber, studentName: student.name, courseName: student.courseName || '' }));
      fetchNextCertNumber(student.courseName);
    } else {
      setForm(p => ({ ...p, rollNumber }));
    }
  };

  const handleCourseChange = (courseName) => {
    setForm(p => ({ ...p, courseName }));
    fetchNextCertNumber(courseName);
  };

  const inp = 'w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-teal-500 bg-gray-50 focus:bg-white transition-all';

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">Enrollment Number *</label>
          <select value={form.rollNumber} onChange={e => handleRollChange(e.target.value)} className={inp}>
            <option value="">-- Select Student --</option>
            {students.map(s => <option key={s._id} value={s.rollNumber}>{s.rollNumber} — {s.name}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">Student Name *</label>
          <input value={form.studentName} onChange={e => setForm(p => ({ ...p, studentName: e.target.value }))} placeholder="Auto-filled" className={inp} />
        </div>
        <div className="space-y-1 col-span-2">
          <label className="text-xs font-semibold text-gray-600">Course *</label>
          <select value={form.courseName} onChange={e => handleCourseChange(e.target.value)} className={inp}>
            <option value="">-- Select Course --</option>
            {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="space-y-1 col-span-2">
          <label className="text-xs font-semibold text-gray-600">Certificate Number *</label>
          <div className="relative">
            <input
              value={form.certificateNumber}
              onChange={e => setForm(p => ({ ...p, certificateNumber: e.target.value }))}
              placeholder="Auto-generated on course select"
              className={`${inp} ${loadingCertNo ? 'opacity-60' : ''}`}
            />
            {loadingCertNo && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <p className="text-[10px] text-gray-400 mt-0.5">Auto-filled when course is selected. You can edit manually.</p>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">Grade</label>
          <input value={form.grade} onChange={e => setForm(p => ({ ...p, grade: e.target.value }))} placeholder="A+" className={inp} />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">Issue Date</label>
          <input type="date" value={form.issueDate} onChange={e => setForm(p => ({ ...p, issueDate: e.target.value }))} className={inp} />
        </div>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={saving}
          className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2">
          {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {isEdit ? 'Update Certificate' : 'Save Certificate'}
        </button>
      </div>
    </form>
  );
}

function TestFormModal({ initial, onSave, onClose, saving }) {
  const EMPTY_Q = { question: '', options: ['', '', '', ''], correctAnswer: 0, marks: 1 };
  const [form, setForm] = useState({
    title: initial?.title || '',
    description: initial?.description || '',
    month: initial?.month || '',
    duration: initial?.duration || 30,
    isActive: initial?.isActive ?? true,
    questions: initial?.questions?.length ? initial.questions.map(q => ({ ...q, options: q.options?.length ? q.options : ['','','',''] })) : [{ ...EMPTY_Q }],
  });

  const setQ = (i, field, val) => setForm(p => ({ ...p, questions: p.questions.map((q, j) => j === i ? { ...q, [field]: val } : q) }));
  const setOpt = (qi, oi, val) => setForm(p => ({ ...p, questions: p.questions.map((q, j) => j === qi ? { ...q, options: q.options.map((o, k) => k === oi ? val : o) } : q) }));
  const addQ = () => setForm(p => ({ ...p, questions: [...p.questions, { ...EMPTY_Q, options: ['','','',''] }] }));
  const removeQ = (i) => setForm(p => ({ ...p, questions: p.questions.filter((_, j) => j !== i) }));

  const inp = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-gray-50';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
          <h2 className="text-lg font-black text-gray-900">{initial ? 'Edit Test' : 'Create Monthly Test'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-semibold text-gray-600">Test Title *</label>
              <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. June Monthly Test" required className={inp} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Month</label>
              <input value={form.month} onChange={e => setForm(p => ({ ...p, month: e.target.value }))} placeholder="e.g. June 2025" className={inp} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Duration (minutes)</label>
              <input type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: Number(e.target.value) }))} min={1} className={inp} />
            </div>
            <div className="col-span-2 space-y-1">
              <label className="text-xs font-semibold text-gray-600">Description</label>
              <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} placeholder="Optional description" className={`${inp} resize-none`} />
            </div>
            <div className="col-span-2 flex items-center gap-3">
              <label className="text-xs font-semibold text-gray-600">Status</label>
              <button type="button" onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${form.isActive ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {form.isActive ? '✓ Active' : 'Inactive'}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-black text-gray-700">Questions ({form.questions.length})</label>
              <button type="button" onClick={addQ} className="flex items-center gap-1 text-xs text-indigo-600 font-bold hover:text-indigo-700">
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>
            {form.questions.map((q, i) => (
              <div key={i} className="border border-gray-200 rounded-2xl p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-600">Q{i + 1}</span>
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-500">Marks:</label>
                    <input type="number" value={q.marks} onChange={e => setQ(i, 'marks', Number(e.target.value))} min={1} className="w-14 px-2 py-1 border border-gray-200 rounded-lg text-xs text-center bg-white" />
                    {form.questions.length > 1 && (
                      <button type="button" onClick={() => removeQ(i)} className="p-1 text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </div>
                <input value={q.question} onChange={e => setQ(i, 'question', e.target.value)} placeholder="Enter question" required
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500 bg-white" />
                <div className="grid grid-cols-2 gap-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all cursor-pointer ${
                      q.correctAnswer === oi ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white'
                    }`} onClick={() => setQ(i, 'correctAnswer', oi)}>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                        q.correctAnswer === oi ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>{String.fromCharCode(65 + oi)}</span>
                      <input value={opt} onChange={e => setOpt(i, oi, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        className="flex-1 text-xs bg-transparent outline-none" onClick={e => e.stopPropagation()} />
                    </div>
                  ))}
                </div>
                <p className="text-[10px] text-gray-400">Click option border to mark as correct answer (green = correct)</p>
              </div>
            ))}
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving}
              className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2">
              {saving && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {initial ? 'Update Test' : 'Create Test'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function BranchDashboard() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [results, setResults] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState('');
  const [viewItem, setViewItem] = useState(null);
  const [viewType, setViewType] = useState('');
  const [resultFilter, setResultFilter] = useState('all');
  const [certFilter, setCertFilter] = useState('all');
  const [admissionFilter, setAdmissionFilter] = useState('all');
  const [tests, setTests] = useState([]);
  const [testModal, setTestModal] = useState(null); // null | 'add' | 'edit' | 'attempts'
  const [selectedTest, setSelectedTest] = useState(null);
  const [testAttempts, setTestAttempts] = useState([]);
  const [savingTest, setSavingTest] = useState(false);
  const importRef = useRef();

  const exportExcel = () => {
    const rows = students.map(s => ({
      Name: s.name, Email: s.email, Phone: s.phone || '',
      'Enrollment No': s.enrollmentNumber || '', 'Roll No': s.rollNumber || '',
      'Form No': s.formNo || '', Course: s.courseName || '',
      Batch: s.batch || '', Status: s.isApproved ? 'Approved' : 'Pending',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `Branch_Students_${Date.now()}.xlsx`);
    toast.success('Exported!');
  };

  const importExcel = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'binary' });
        const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
        let added = 0;
        for (const row of rows) {
          if (!row.Name || !row.Email) continue;
          try {
            await api.post('/branch/students', { name: row.Name, email: row.Email, phone: row.Phone || '', batch: row.Batch || '', courseName: row.Course || '' });
            added++;
          } catch {}
        }
        toast.success(`${added} students imported!`);
        loadData();
      } catch { toast.error('Invalid Excel file'); }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const loadData = () => {
    api.get('/branch/dashboard-stats').then(r => setStats(r.data.stats)).catch(() => {});
    api.get('/branch/students').then(r => setStudents(r.data.students || [])).catch(() => {});
    api.get('/branch/admissions').then(r => setAdmissions(r.data.admissions || [])).catch(() => {});
    api.get('/branch/results').then(r => setResults(r.data.results || [])).catch(() => {});
    api.get('/branch/certificates').then(r => setCertificates(r.data.certificates || [])).catch(() => {});
    api.get('/branch/tests').then(r => setTests(r.data.tests || [])).catch(() => {});
  };

  useEffect(() => {
    if (!user || user.role !== 'branch') { navigate('/login'); return; }
    loadData();
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleAddStudent = async (form, photoFile) => {
    if (!form.name || !form.email) return toast.error('Name and email required');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v));
      if (photoFile) fd.append('photo', photoFile);
      const r = await api.post('/branch/students', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStudents(p => [r.data.student, ...p]);
      setModal(null);
      toast.success('Student added! Approve to send login credentials.');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleEditStudent = async (form, photoFile) => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => v !== undefined && v !== null && fd.append(k, v));
      if (photoFile) fd.append('photo', photoFile);
      const r = await api.put(`/branch/students/${selected._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStudents(p => p.map(s => s._id === selected._id ? r.data.student : s));
      setModal(null);
      toast.success('Student updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleApprove = async id => {
    setApproving(id);
    try {
      await api.put(`/branch/students/${id}/approve`);
      setStudents(p => p.map(s => s._id === id ? { ...s, isApproved: true, isActive: true } : s));
      toast.success('Student approved! Login credentials sent via email.');
    } catch { toast.error('Approval failed'); }
    setApproving('');
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete student "${name}"?`)) return;
    try {
      await api.delete(`/branch/students/${id}`);
      setStudents(p => p.filter(s => s._id !== id));
      toast.success('Student deleted');
    } catch { toast.error('Delete failed'); }
  };

  // Results CRUD
  const handleAddResult = async form => {
    if (!form.rollNumber || !form.studentName) return toast.error('Roll number and student name required');
    setSaving(true);
    try {
      const r = await api.post('/branch/results', form);
      setResults(p => [r.data.result, ...p]);
      setModal(null);
      toast.success('Result added!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleEditResult = async form => {
    setSaving(true);
    try {
      const r = await api.put(`/branch/results/${selected._id}`, form);
      setResults(p => p.map(x => x._id === selected._id ? r.data.result : x));
      setModal(null);
      toast.success('Result updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleDeleteResult = async (id) => {
    if (!window.confirm('Delete this result?')) return;
    try {
      await api.delete(`/branch/results/${id}`);
      setResults(p => p.filter(x => x._id !== id));
      toast.success('Result deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleApproveResult = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.put(`/branch/results/${id}/approve`, { isApproved: newStatus });
      setResults(p => p.map(x => x._id === id ? { ...x, isApproved: newStatus } : x));
      toast.success(newStatus ? 'Result approved! Student can now view it.' : 'Result hidden from student.');
    } catch { toast.error('Failed'); }
  };

  const handleApproveCert = async (id, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await api.put(`/branch/certificates/${id}/approve`, { isApproved: newStatus });
      setCertificates(p => p.map(x => x._id === id ? { ...x, isApproved: newStatus } : x));
      toast.success(newStatus ? 'Certificate approved! Student can now view it.' : 'Certificate hidden from student.');
    } catch { toast.error('Failed'); }
  };

  // Certificates CRUD
  const handleAddCert = async form => {
    if (!form.rollNumber || !form.studentName || !form.certificateNumber) return toast.error('Roll no, student name and cert no required');
    setSaving(true);
    try {
      const r = await api.post('/branch/certificates', form);
      setCertificates(p => [r.data.certificate, ...p]);
      setModal(null);
      toast.success('Certificate added!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleEditCert = async form => {
    setSaving(true);
    try {
      const r = await api.put(`/branch/certificates/${selected._id}`, form);
      setCertificates(p => p.map(x => x._id === selected._id ? r.data.certificate : x));
      setModal(null);
      toast.success('Certificate updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleAdmissionStatus = async (id, status) => {
    try {
      const { data } = await api.put(`/branch/admissions/${id}/status`, { status });
      setAdmissions(p => p.map(a => a._id === id ? { ...a, status } : a));
      if (data.newStudent) {
        // Reload full students list to get complete data from DB
        api.get('/branch/students').then(r => setStudents(r.data.students || [])).catch(() => {});
        toast.success('Admission Approved! Student account created & credentials sent via email.');
      } else {
        toast.success(`Admission ${status}!`);
      }
    } catch { toast.error('Failed to update status'); }
  };

  // Tests CRUD
  const handleSaveTest = async (form) => {
    setSavingTest(true);
    try {
      if (selectedTest) {
        const r = await api.put(`/branch/tests/${selectedTest._id}`, form);
        setTests(p => p.map(t => t._id === selectedTest._id ? r.data.test : t));
        toast.success('Test updated!');
      } else {
        const r = await api.post('/branch/tests', form);
        setTests(p => [r.data.test, ...p]);
        toast.success('Test created!');
      }
      setTestModal(null); setSelectedTest(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSavingTest(false);
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm('Delete this test?')) return;
    try {
      await api.delete(`/branch/tests/${id}`);
      setTests(p => p.filter(t => t._id !== id));
      toast.success('Test deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleViewAttempts = async (test) => {
    setSelectedTest(test);
    try {
      const r = await api.get(`/branch/tests/${test._id}/attempts`);
      setTestAttempts(r.data.attempts || []);
    } catch { setTestAttempts([]); }
    setTestModal('attempts');
  };

  const handleDeleteAdmission = async (id) => {
    if (!window.confirm('Delete this admission?')) return;
    try {
      await api.delete(`/branch/admissions/${id}`);
      setAdmissions(p => p.filter(a => a._id !== id));
      toast.success('Admission deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleDeleteCert = async (id) => {
    if (!window.confirm('Delete this certificate?')) return;
    try {
      await api.delete(`/branch/certificates/${id}`);
      setCertificates(p => p.filter(x => x._id !== id));
      toast.success('Certificate deleted');
    } catch { toast.error('Delete failed'); }
  };

  const filtered = (list, keys) => {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(item => keys.some(k => item[k]?.toString().toLowerCase().includes(q)));
  };

  const studentFields = [['Roll No', 'rollNumber'], ['Enrollment No', 'enrollmentNumber'], ['Form No', 'formNo'], ['Name', 'name'], ['Email', 'email'], ['Phone', 'phone'], ['Course', 'courseName'], ['Batch', 'batch'], ['Father', 'fatherName'], ['DOB', 'dob'], ['Address', 'address'], ['Status', 'isApproved']];
  const resultFields = [['Student', 'studentName'], ['Enrollment No', 'rollNumber'], ['Course', 'courseName'], ['Total Marks', 'totalMarks'], ['Obtained', 'obtainedMarks'], ['Percentage', 'percentage'], ['Grade', 'grade'], ['Status', 'status']];
  const certFields = [['Student', 'studentName'], ['Enrollment No', 'rollNumber'], ['Course', 'courseName'], ['Cert No', 'certificateNumber'], ['Grade', 'grade'], ['Issue Date', 'issueDate']];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 flex flex-col">

      {/* ── HEADER ── */}
      <header className="bg-white border-b border-blue-100 shadow-md sticky top-0 z-40">
        <div className="max-w-full px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button onClick={() => setSidebarOpen(o => !o)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-blue-100 hover:bg-blue-200 text-blue-700 transition-all shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-black text-gray-900 text-xs sm:text-sm leading-tight truncate max-w-[130px] sm:max-w-[200px] md:max-w-xs">{user?.branchName || 'Branch Dashboard'}</div>
              <div className="text-[9px] sm:text-[10px] font-bold text-blue-600 font-mono">{user?.branchCode}</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-green-50 rounded-xl border border-green-200">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-bold text-green-700">{user?.branchCity}</span>
            </div>
            <DevCredit popupDown />
            <button onClick={toggle}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl text-xs font-bold text-white bg-red-500 hover:bg-red-600 border border-red-400 transition-all">
              <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* ── SIDEBAR OVERLAY ── */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── SIDEBAR ── */}
        <aside className={`fixed top-14 sm:top-16 left-0 h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] w-56 sm:w-60 bg-white border-r border-blue-100 shadow-xl z-30 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:h-auto lg:shadow-none`}>
          <div className="flex-1 py-3 overflow-y-auto">
            <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest px-4 mb-2">Navigation</p>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id}
                onClick={() => { setActiveTab(id); setSearch(''); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold transition-all ${
                  activeTab === id
                    ? 'bg-blue-600 text-white rounded-xl mx-2 w-[calc(100%-1rem)]'
                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-700'
                }`}>
                <Icon className="w-4 h-4 shrink-0" /> {label}
              </button>
            ))}
          </div>
          <div className="p-3 border-t border-blue-100">
            <div className="text-[10px] text-gray-500 font-semibold truncate">{user?.email}</div>
            <div className="text-[9px] text-blue-400 mt-0.5">{user?.branchCity}</div>
          </div>
        </aside>

      <div className="flex-1 min-w-0 max-w-full px-3 sm:px-4 py-4 sm:py-5 space-y-4 sm:space-y-5">

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-5">

            {/* Hero card */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-600 rounded-3xl overflow-hidden shadow-xl">
              <div className="absolute -top-8 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-6 -left-6 w-36 h-36 bg-violet-400/20 rounded-full blur-2xl" />
              <div className="relative px-6 py-6 flex flex-col sm:flex-row items-center sm:items-start gap-5">
                {/* Avatar */}
                <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center shadow-xl shrink-0">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                {/* Info */}
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-blue-200 text-xs font-semibold mb-0.5">Branch Dashboard</p>
                  <h2 className="text-xl sm:text-2xl font-black text-white leading-tight mb-2">{user?.branchName}</h2>
                  <div className="flex flex-wrap justify-center sm:justify-start gap-2">
                    {[
                      { text: user?.branchCode, mono: true },
                      { text: user?.branchCity },
                      { text: user?.email },
                    ].filter(i => i.text).map((item, i) => (
                      <span key={i} className={`bg-white/15 backdrop-blur-sm text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-white/20 ${item.mono ? 'font-mono' : ''}`}>
                        {item.text}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Status */}
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <div className="px-4 py-2 bg-green-400/20 border border-green-400/40 rounded-2xl">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-green-300 text-xs font-black">Active Branch</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              {[
                { icon: Users, label: 'Students', value: stats?.students, gradient: 'from-blue-500 to-blue-600', delay: 0, tab: 'students' },
                { icon: CheckCircle, label: 'Active', value: stats?.active, gradient: 'from-green-500 to-emerald-600', delay: 0.05, tab: 'students' },
                { icon: ClipboardList, label: 'Admissions', value: stats?.admissions, gradient: 'from-orange-500 to-amber-500', delay: 0.1, tab: 'admissions' },
                { icon: BookOpen, label: 'Courses', value: stats?.courses, gradient: 'from-violet-500 to-purple-600', delay: 0.15 },
                { icon: Award, label: 'Results', value: stats?.results, gradient: 'from-yellow-500 to-orange-500', delay: 0.2, tab: 'results' },
                { icon: FileText, label: 'Certificates', value: stats?.certificates, gradient: 'from-teal-500 to-cyan-600', delay: 0.25, tab: 'certificates' },
              ].map(({ icon: Icon, label, value, gradient, delay, tab }) => (
                <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
                  onClick={tab ? () => { setActiveTab(tab); setSearch(''); } : undefined}
                  className={`bg-white rounded-2xl p-3 sm:p-4 border border-blue-100 overflow-hidden relative group shadow-sm ${
                    tab ? 'cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-300' : ''
                  }`}>
                  <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-2 sm:mb-3 shadow-md`}>
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-gray-900">{value ?? 0}</div>
                  <div className="text-[10px] sm:text-[11px] text-gray-500 font-semibold mt-0.5">{label}</div>
                </motion.div>
              ))}
            </div>

            {/* Analytics Charts */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
              {/* Students by Course */}
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-5">
                <h3 className="text-sm font-black text-gray-800 mb-4">📊 Students by Course</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={(() => {
                    const map = {};
                    students.forEach(s => {
                      const name = (s.courseName || 'Unknown').split('(')[0].trim().slice(0, 12);
                      map[name] = (map[name] || 0) + 1;
                    });
                    return Object.entries(map).map(([name, count]) => ({ name, count }));
                  })()} margin={{ top: 0, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} angle={-35} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b' }} />
                    <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Admission Status */}
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-5">
                <h3 className="text-sm font-black text-gray-800 mb-4">📋 Admission Status</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={(() => {
                        const approved = admissions.filter(a => a.status === 'Approved').length;
                        const pending = admissions.filter(a => !a.status || a.status === 'Pending').length;
                        const rejected = admissions.filter(a => a.status === 'Rejected').length;
                        return [
                          { name: 'Approved', value: approved },
                          { name: 'Pending', value: pending },
                          { name: 'Rejected', value: rejected },
                        ].filter(d => d.value > 0);
                      })()}
                      cx="50%" cy="50%" outerRadius={75} dataKey="value" label={({ name, value }) => `${name}: ${value}`}
                      labelLine={false}
                    >
                      {['#10b981', '#f59e0b', '#ef4444'].map((color, i) => <Cell key={i} fill={color} />)}
                    </Pie>
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11, color: '#475569' }} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Results Overview */}
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-5">
                <h3 className="text-sm font-black text-gray-800 mb-4">🏆 Results Overview</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={(() => {
                    const map = {};
                    results.forEach(r => {
                      const name = (r.courseName || 'Unknown').split('(')[0].trim().slice(0, 12);
                      if (!map[name]) map[name] = { name, Pass: 0, Fail: 0 };
                      map[name][r.status === 'Pass' ? 'Pass' : 'Fail']++;
                    });
                    return Object.values(map);
                  })()} margin={{ top: 0, right: 10, left: -20, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 600, fill: '#64748b' }} angle={-35} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b' }} />
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11, color: '#475569' }} />
                    <Bar dataKey="Pass" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Fail" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Student Approval Status */}
              <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 sm:p-5">
                <h3 className="text-sm font-black text-gray-800 mb-4">👥 Student Approval Status</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Approved', value: students.filter(s => s.isApproved).length },
                        { name: 'Pending', value: students.filter(s => !s.isApproved).length },
                      ].filter(d => d.value > 0)}
                      cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value"
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#f59e0b" />
                    </Pie>
                    <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 11, color: '#475569' }} />
                    <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, background: '#fff', border: '1px solid #e2e8f0', color: '#1e293b' }}
                      formatter={(value, name) => [value, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2">
                  <div className="text-center">
                    <div className="text-xl font-black text-blue-600">{students.filter(s => s.isApproved).length}</div>
                    <div className="text-xs text-gray-500 font-medium">Approved</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-black text-amber-500">{students.filter(s => !s.isApproved).length}</div>
                    <div className="text-xs text-gray-500 font-medium">Pending</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-black text-teal-600">{certificates.length}</div>
                    <div className="text-xs text-gray-500 font-medium">Certificates</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Branch info card */}
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-blue-100 shadow-sm overflow-hidden">
              <div className="px-5 py-3 flex items-center gap-2 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
                <span className="text-gray-800 font-black text-sm">Branch Information</span>
              </div>
              <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { icon: '🏢', label: 'Branch Name', value: user?.branchName },
                  { icon: '🎫', label: 'Branch Code', value: user?.branchCode, mono: true },
                  { icon: '📍', label: 'City', value: user?.branchCity },
                  { icon: '📞', label: 'Phone', value: user?.phone || '—' },
                  { icon: '📧', label: 'Email', value: user?.email },
                  { icon: '📮', label: 'Address', value: user?.branchAddress || user?.address || '—' },
                ].map(({ icon, label, value, mono }) => (
                  <div key={label} className="flex items-start gap-3 p-3 bg-blue-50/60 rounded-xl border border-blue-100">
                    <span className="text-lg shrink-0">{icon}</span>
                    <div className="min-w-0">
                      <div className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">{label}</div>
                      <div className={`text-sm font-bold text-gray-800 truncate ${mono ? 'font-mono text-blue-600' : ''}`}>{value || '—'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {/* Students */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-black text-gray-900">Students <span className="text-blue-600">({students.length})</span></h2>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white w-48 font-medium" />
                </div>
                <input ref={importRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={importExcel} />
                <button onClick={() => importRef.current.click()}
                  className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-md">
                  <Upload className="w-4 h-4" /> Import
                </button>
                <button onClick={exportExcel}
                  className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors shadow-md">
                  <Download className="w-4 h-4" /> Export
                </button>
                <button onClick={() => { setSelected(null); setModal('add'); }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:-translate-y-0.5">
                  <Plus className="w-4 h-4" /> Add Student
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-blue-600 to-indigo-600">
                    <tr>{['Name', 'Enrollment No', 'Course', 'Phone', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-black text-white uppercase tracking-wider">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered(students, ['name', 'enrollmentNumber', 'rollNumber', 'courseName', 'phone']).map((s, i) => (
                      <tr key={s._id} className={`hover:bg-blue-50/50 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {s.photo ? (
                              <img src={getPhotoUrl(s.photo)} alt={s.name}
                                className="w-9 h-9 rounded-full object-cover border-2 border-blue-100 flex-shrink-0" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-bold text-blue-600">{s.name[0].toUpperCase()}</span>
                              </div>
                            )}
                            <div>
                              <div className="font-black text-gray-900">{s.name}</div>
                              <div className="text-xs font-semibold text-gray-500">{s.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 font-black font-mono text-green-700 text-sm">{s.enrollmentNumber || '—'}</td>
                        <td className="px-4 py-3 font-bold text-gray-700 text-xs">{s.courseName || '—'}</td>
                        <td className="px-4 py-3 font-bold text-gray-700 text-xs">{s.phone || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black ${s.isApproved ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-yellow-100 text-yellow-800 border border-yellow-200'}`}>
                            {s.isApproved ? '✓ Approved' : '⏳ Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => { setViewItem(s); setViewType('student'); }} className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors" title="View"><Eye className="w-3.5 h-3.5" /></button>
                            <button onClick={() => { setSelected(s); setModal('edit'); }} className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                            {!s.isApproved && (
                              <button onClick={() => handleApprove(s._id)} disabled={approving === s._id} className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors disabled:opacity-50" title="Approve">
                                {approving === s._id ? <div className="w-3.5 h-3.5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <button onClick={() => handleDelete(s._id, s.name)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-16 text-gray-400">
                        <Users className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                        <p className="font-semibold">No students yet. Click "Add Student" to get started.</p>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            {students.filter(s => !s.isApproved).length > 0 && (
              <div className="bg-yellow-50 border border-yellow-300 rounded-2xl p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600 shrink-0" />
                <p className="text-sm font-bold text-yellow-900">
                  <strong>{students.filter(s => !s.isApproved).length}</strong> student(s) pending approval. Click ✓ to approve and send login credentials via email.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Admissions */}
        {activeTab === 'admissions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-black text-gray-900">Admissions <span className="text-orange-500">({admissions.length})</span></h2>
              <div className="flex items-center gap-3">
                <select value={admissionFilter} onChange={e => setAdmissionFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white text-gray-700">
                  <option value="all">All</option>
                  <option value="Pending">⏳ Pending</option>
                  <option value="Approved">✓ Approved</option>
                  <option value="Rejected">✗ Rejected</option>
                </select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 bg-white w-48" />
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-orange-500 to-amber-500">
                    <tr>{['Name', 'Email', 'Phone', 'Course', 'Qualification', 'Gender', 'Status', 'Date', 'Action'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-black text-white uppercase tracking-wider">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered(admissions, ['name', 'email', 'phone', 'qualification'])
                      .filter(a => admissionFilter === 'all' ? true : (a.status || 'Pending') === admissionFilter)
                      .map((a, i) => (
                      <tr key={a._id} className={`hover:bg-orange-50/40 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-4 py-3">
                          <div className="font-black text-gray-900">{a.name}</div>
                          {a.address && <div className="text-xs font-semibold text-gray-500 truncate max-w-[120px]">{a.address}</div>}
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-700 text-xs">{a.email}</td>
                        <td className="px-4 py-3 font-black text-gray-800 text-xs">{a.phone}</td>
                        <td className="px-4 py-3 font-bold text-indigo-700 text-xs">{a.course?.title || a.courseName || '—'}</td>
                        <td className="px-4 py-3 font-bold text-gray-700 text-xs">{a.qualification || '—'}</td>
                        <td className="px-4 py-3 font-bold text-gray-700 text-xs">{a.gender || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${
                            a.status === 'Approved' ? 'bg-green-100 text-green-800 border-green-200' :
                            a.status === 'Rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                            'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}>{a.status || 'Pending'}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-gray-600 text-xs">
                          {a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-IN') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            {a.status !== 'Approved' && (
                              <button onClick={() => handleAdmissionStatus(a._id, 'Approved')} className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-xs font-black transition-colors">✓ Approve</button>
                            )}
                            {a.status !== 'Rejected' && (
                              <button onClick={() => handleAdmissionStatus(a._id, 'Rejected')} className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-black transition-colors">✗ Reject</button>
                            )}
                            {a.status !== 'Pending' && (
                              <button onClick={() => handleAdmissionStatus(a._id, 'Pending')} className="px-2 py-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg text-xs font-black transition-colors">↺</button>
                            )}
                            <button onClick={() => handleDeleteAdmission(a._id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {admissions.length === 0 && (
                      <tr><td colSpan={9} className="text-center py-12 text-gray-400">
                        <ClipboardList className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                        <p className="font-semibold">No admissions found for your branch.</p>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {activeTab === 'results' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-black text-gray-900">Results <span className="text-yellow-600">({results.length})</span></h2>
              <div className="flex items-center gap-3">
                <select value={resultFilter} onChange={e => setResultFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white text-gray-700">
                  <option value="all">All</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="approved">✓ Approved</option>
                </select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 bg-white w-48" />
                </div>
                <button onClick={() => { setSelected(null); setModal('add-result'); }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:-translate-y-0.5">
                  <Plus className="w-4 h-4" /> Add Result
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-yellow-500 to-orange-500">
                    <tr>{['Student', 'Enrollment No', 'Course', 'Marks', 'Grade', 'Status', 'Approval', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-black text-white uppercase tracking-wider">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered(results, ['studentName', 'rollNumber', 'courseName'])
                      .filter(r => resultFilter === 'all' ? true : resultFilter === 'approved' ? r.isApproved === true : r.isApproved !== true)
                      .map((r, i) => (
                      <tr key={r._id} className={`hover:bg-yellow-50/40 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-4 py-3 font-black text-gray-900">{r.studentName}</td>
                        <td className="px-4 py-3 font-black font-mono text-blue-700 text-xs">{r.rollNumber}</td>
                        <td className="px-4 py-3 font-bold text-gray-700 text-xs">{r.courseName || '—'}</td>
                        <td className="px-4 py-3 font-black text-gray-900">{r.obtainedMarks ?? '—'}<span className="text-gray-400 font-bold">/{r.totalMarks ?? '—'}</span></td>
                        <td className="px-4 py-3"><span className="font-black text-indigo-700 text-base">{r.grade || '—'}</span></td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-black border ${r.status === 'Pass' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-700 border-red-200'}`}>{r.status || '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleApproveResult(r._id, r.isApproved === true)}
                            className={`px-3 py-1 rounded-full text-xs font-black border transition-all ${
                              r.isApproved === true ? 'bg-green-100 text-green-800 border-green-200 hover:bg-red-100 hover:text-red-700 hover:border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-green-100 hover:text-green-800'
                            }`}>
                            {r.isApproved === true ? '✓ Approved' : '⏳ Pending'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => { setViewItem(r); setViewType('result'); }} className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                            <button onClick={() => { setSelected(r); setModal('edit-result'); }} className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteResult(r._id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {results.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-gray-400"><p className="font-semibold">No results found. Click "Add Result" to add one.</p></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Monthly Tests */}
        {activeTab === 'tests' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-black text-gray-900">Monthly Tests ({tests.length})</h2>
              <button onClick={() => { setSelectedTest(null); setTestModal('add'); }}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md">
                <Plus className="w-4 h-4" /> Create Test
              </button>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tests.map(t => (
                <div key={t._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-black text-gray-900 text-sm">{t.title}</div>
                      <div className="text-xs text-indigo-600 font-semibold mt-0.5">{t.month || 'No month set'}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${t.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {t.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[['Questions', t.questions?.length || 0], ['Marks', t.totalMarks || 0], ['Duration', `${t.duration}m`]].map(([l, v]) => (
                      <div key={l} className="bg-gray-50 rounded-xl py-2">
                        <div className="text-sm font-black text-gray-900">{v}</div>
                        <div className="text-[10px] text-gray-400 font-medium">{l}</div>
                      </div>
                    ))}
                  </div>
                  {t.description && <p className="text-xs text-gray-500 line-clamp-2">{t.description}</p>}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleViewAttempts(t)}
                      className="flex-1 flex items-center justify-center gap-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors">
                      <Eye className="w-3.5 h-3.5" /> Attempts
                    </button>
                    <button onClick={() => { setSelectedTest(t); setTestModal('edit'); }}
                      className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl transition-colors">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => handleDeleteTest(t._id)}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {tests.length === 0 && (
                <div className="col-span-3 text-center py-16 text-gray-400">
                  <ClipboardCheck className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  <p>No tests yet. Click "Create Test" to add one.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Certificates */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-black text-gray-900">Certificates <span className="text-teal-600">({certificates.length})</span></h2>
              <div className="flex items-center gap-3">
                <select value={certFilter} onChange={e => setCertFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-bold focus:outline-none focus:border-blue-500 bg-white text-gray-700">
                  <option value="all">All</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="approved">✓ Approved</option>
                </select>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 bg-white w-48" />
                </div>
                <button onClick={() => { setSelected(null); setModal('add-cert'); }}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:-translate-y-0.5">
                  <Plus className="w-4 h-4" /> Add Certificate
                </button>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gradient-to-r from-teal-600 to-cyan-600">
                    <tr>{['Student', 'Enrollment No', 'Course', 'Certificate No', 'Grade', 'Issue Date', 'Approval', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-black text-white uppercase tracking-wider">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered(certificates, ['studentName', 'rollNumber', 'courseName', 'certificateNumber'])
                      .filter(c => certFilter === 'all' ? true : certFilter === 'approved' ? c.isApproved === true : c.isApproved !== true)
                      .map((c, i) => (
                      <tr key={c._id} className={`hover:bg-teal-50/40 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-4 py-3 font-black text-gray-900">{c.studentName}</td>
                        <td className="px-4 py-3 font-black font-mono text-blue-700 text-xs">{c.rollNumber}</td>
                        <td className="px-4 py-3 font-bold text-gray-700 text-xs">{c.courseName || '—'}</td>
                        <td className="px-4 py-3 font-black font-mono text-indigo-700 text-xs">{c.certificateNumber}</td>
                        <td className="px-4 py-3"><span className="font-black text-green-700 text-base">{c.grade || '—'}</span></td>
                        <td className="px-4 py-3 font-bold text-gray-700 text-xs">{c.issueDate ? new Date(c.issueDate).toLocaleDateString('en-IN') : '—'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleApproveCert(c._id, c.isApproved === true)}
                            className={`px-3 py-1 rounded-full text-xs font-black border transition-all ${
                              c.isApproved === true ? 'bg-green-100 text-green-800 border-green-200 hover:bg-red-100 hover:text-red-700 hover:border-red-200' : 'bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-green-100 hover:text-green-800'
                            }`}>
                            {c.isApproved === true ? '✓ Approved' : '⏳ Pending'}
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => { setViewItem(c); setViewType('certificate'); }} className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg"><Eye className="w-3.5 h-3.5" /></button>
                            <button onClick={() => { setSelected(c); setModal('edit-cert'); }} className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg"><Pencil className="w-3.5 h-3.5" /></button>
                            {c.isApproved !== true && (
                              <button onClick={() => handleApproveCert(c._id)} className="p-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                            )}
                            <button onClick={() => handleDeleteCert(c._id)} className="p-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {certificates.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-gray-400"><p className="font-semibold">No certificates found. Click "Add Certificate" to add one.</p></td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {modal === 'add' && (
          <Modal title="Add New Student" onClose={() => setModal(null)}>
            <StudentForm initial={EMPTY_STUDENT} onSave={handleAddStudent} onClose={() => setModal(null)} saving={saving} />
          </Modal>
        )}
        {modal === 'edit' && selected && (
          <Modal title="Edit Student" onClose={() => setModal(null)}>
            <StudentForm initial={selected} onSave={handleEditStudent} onClose={() => setModal(null)} saving={saving} />
          </Modal>
        )}
        {modal === 'add-result' && (
          <Modal title="Add Result" onClose={() => setModal(null)}>
            <ResultForm initial={EMPTY_RESULT} students={students} onSave={handleAddResult} onClose={() => setModal(null)} saving={saving} />
          </Modal>
        )}
        {modal === 'edit-result' && selected && (
          <Modal title="Edit Result" onClose={() => setModal(null)}>
            <ResultForm initial={selected} students={students} onSave={handleEditResult} onClose={() => setModal(null)} saving={saving} />
          </Modal>
        )}
        {(modal === 'add-cert' || (modal === 'edit-cert' && selected)) && (
          <Modal title={modal === 'add-cert' ? 'Add Certificate' : 'Edit Certificate'} onClose={() => setModal(null)}>
            <CertForm
              initial={modal === 'add-cert' ? EMPTY_CERT : selected}
              students={students}
              onSave={modal === 'add-cert' ? handleAddCert : handleEditCert}
              onClose={() => setModal(null)}
              saving={saving}
            />
          </Modal>
        )}
      </AnimatePresence>

      {viewItem && (
        <ViewModal
          title={viewType === 'student' ? 'Student Details' : viewType === 'result' ? 'Result Details' : 'Certificate Details'}
          data={viewItem}
          fields={viewType === 'student' ? studentFields : viewType === 'result' ? resultFields : certFields}
          onClose={() => setViewItem(null)}
        />
      )}

      {/* Test Create/Edit Modal */}
      {(testModal === 'add' || testModal === 'edit') && (
        <TestFormModal
          initial={testModal === 'edit' ? selectedTest : null}
          onSave={handleSaveTest}
          onClose={() => { setTestModal(null); setSelectedTest(null); }}
          saving={savingTest}
        />
      )}

      {/* Test Attempts Modal */}
      {testModal === 'attempts' && selectedTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-black text-gray-900">{selectedTest.title} — Attempts</h2>
                <p className="text-xs text-gray-400">{testAttempts.length} student(s) attempted</p>
              </div>
              <button onClick={() => setTestModal(null)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              {testAttempts.length === 0 ? (
                <p className="text-center py-8 text-gray-400">No attempts yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>{['Student', 'Enrollment No', 'Score', 'Percentage', 'Time', 'Date'].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-xs font-bold text-gray-500 uppercase">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {testAttempts.map(a => (
                      <tr key={a._id} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-semibold text-gray-900">{a.studentName}</td>
                        <td className="px-3 py-2 font-mono text-blue-600 text-xs">{a.rollNumber}</td>
                        <td className="px-3 py-2 font-bold">{a.score}/{a.totalMarks}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            a.percentage >= 60 ? 'bg-green-100 text-green-700' : a.percentage >= 33 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-600'
                          }`}>{a.percentage}%</span>
                        </td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{a.timeTaken ? `${Math.floor(a.timeTaken/60)}m ${a.timeTaken%60}s` : '—'}</td>
                        <td className="px-3 py-2 text-gray-400 text-xs">{new Date(a.submittedAt).toLocaleDateString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
