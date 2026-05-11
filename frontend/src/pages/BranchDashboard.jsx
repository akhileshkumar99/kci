import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Building2, Users, ClipboardList, Award, FileText, LogOut,
  TrendingUp, BookOpen, CheckCircle, Clock, Search, Eye, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const tabs = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'admissions', label: 'Admissions', icon: ClipboardList },
  { id: 'results', label: 'Results', icon: Award },
  { id: 'certificates', label: 'Certificates', icon: FileText },
];

function StatCard({ icon: Icon, label, value, color, delay }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="text-2xl font-black text-gray-900">{value ?? '—'}</div>
        <div className="text-xs text-gray-500 font-medium">{label}</div>
      </div>
    </motion.div>
  );
}

function ViewModal({ title, data, fields, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-6 space-y-3">
          {fields.map(([label, key]) => (
            <div key={key} className="flex justify-between items-start gap-4 py-2 border-b border-gray-50 last:border-0">
              <span className="text-xs font-semibold text-gray-400 shrink-0 w-28">{label}</span>
              <span className="text-sm text-gray-800 font-medium text-right">{data[key] || '—'}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

export default function BranchDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [results, setResults] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [search, setSearch] = useState('');
  const [viewItem, setViewItem] = useState(null);
  const [viewType, setViewType] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'branch') { navigate('/login'); return; }
    api.get('/branch/dashboard-stats').then(r => setStats(r.data.stats)).catch(() => {});
    api.get('/branch/students').then(r => setStudents(r.data.students || [])).catch(() => {});
    api.get('/branch/admissions').then(r => setAdmissions(r.data.admissions || [])).catch(() => {});
    api.get('/branch/results').then(r => setResults(r.data.results || [])).catch(() => {});
    api.get('/branch/certificates').then(r => setCertificates(r.data.certificates || [])).catch(() => {});
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const filterList = (list, keys) => {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(item => keys.some(k => item[k]?.toString().toLowerCase().includes(q)));
  };

  const studentFields = [['Name', 'name'], ['Email', 'email'], ['Phone', 'phone'], ['Roll No', 'rollNumber'], ['Course', 'courseName'], ['Batch', 'batch'], ['Father', 'fatherName'], ['Address', 'address']];
  const admissionFields = [['Name', 'name'], ['Email', 'email'], ['Phone', 'phone'], ['Course', 'course'], ['Qualification', 'qualification'], ['Status', 'status']];
  const resultFields = [['Student', 'studentName'], ['Roll No', 'rollNumber'], ['Course', 'courseName'], ['Marks', 'totalMarks'], ['Grade', 'grade'], ['Status', 'status']];
  const certFields = [['Student', 'studentName'], ['Roll No', 'rollNumber'], ['Course', 'courseName'], ['Cert No', 'certificateNo'], ['Issue Date', 'issueDate']];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-black text-gray-900 text-sm leading-tight">{user?.branchName || 'Branch Dashboard'}</div>
              <div className="text-xs text-blue-600 font-bold">{user?.branchCode}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-bold text-gray-900">{user?.name}</div>
              <div className="text-xs text-gray-400">{user?.branchCity}</div>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${activeTab === id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-black text-gray-900 mb-1">Welcome, {user?.name}! 👋</h2>
              <p className="text-sm text-gray-500">{user?.branchName} — {user?.branchCity}</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { icon: Users, label: 'Total Students', value: stats?.students, color: 'bg-blue-500', delay: 0 },
                { icon: CheckCircle, label: 'Active Students', value: stats?.active, color: 'bg-green-500', delay: 0.05 },
                { icon: ClipboardList, label: 'Admissions', value: stats?.admissions, color: 'bg-orange-500', delay: 0.1 },
                { icon: BookOpen, label: 'Courses', value: stats?.courses, color: 'bg-violet-500', delay: 0.15 },
                { icon: Award, label: 'Results', value: stats?.results, color: 'bg-yellow-500', delay: 0.2 },
                { icon: FileText, label: 'Certificates', value: stats?.certificates, color: 'bg-teal-500', delay: 0.25 },
              ].map(s => <StatCard key={s.label} {...s} />)}
            </div>

            {/* Branch Info Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" /> Branch Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  ['Branch Name', user?.branchName],
                  ['Branch Code', user?.branchCode],
                  ['City', user?.branchCity],
                  ['Phone', user?.branchPhone || user?.phone || '—'],
                  ['Email', user?.email],
                  ['Address', user?.branchAddress || '—'],
                ].map(([label, value]) => (
                  <div key={label} className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-gray-400">{label}</span>
                    <span className="text-sm font-bold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Students */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xl font-black text-gray-900">Students ({students.length})</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white w-56" />
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Name', 'Roll No', 'Course', 'Phone', 'Status', 'Action'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filterList(students, ['name', 'rollNumber', 'courseName', 'phone']).map(s => (
                      <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900">{s.name}</td>
                        <td className="px-4 py-3 font-mono text-blue-600 text-xs">{s.rollNumber || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{s.courseName || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{s.phone || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {s.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => { setViewItem(s); setViewType('student'); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors">
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-12 text-gray-400">No students found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Admissions */}
        {activeTab === 'admissions' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900">Admissions ({admissions.length})</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Name', 'Email', 'Phone', 'Course', 'Status', 'Date', 'Action'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {admissions.map(a => (
                      <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900">{a.name}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{a.email}</td>
                        <td className="px-4 py-3 text-gray-600">{a.phone}</td>
                        <td className="px-4 py-3 text-gray-600">{a.course || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${a.status === 'approved' ? 'bg-green-100 text-green-700' : a.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                            {a.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => { setViewItem(a); setViewType('admission'); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors">
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {admissions.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-12 text-gray-400">No admissions found</td></tr>
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
            <h2 className="text-xl font-black text-gray-900">Results ({results.length})</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Student', 'Roll No', 'Course', 'Marks', 'Grade', 'Status', 'Action'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {results.map(r => (
                      <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900">{r.studentName}</td>
                        <td className="px-4 py-3 font-mono text-blue-600 text-xs">{r.rollNumber}</td>
                        <td className="px-4 py-3 text-gray-600">{r.courseName || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{r.totalMarks ?? '—'}</td>
                        <td className="px-4 py-3 font-bold text-indigo-600">{r.grade || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                            {r.status || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => { setViewItem(r); setViewType('result'); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors">
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {results.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-12 text-gray-400">No results found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Certificates */}
        {activeTab === 'certificates' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-gray-900">Certificates ({certificates.length})</h2>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Student', 'Roll No', 'Course', 'Certificate No', 'Issue Date', 'Action'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {certificates.map(c => (
                      <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-gray-900">{c.studentName}</td>
                        <td className="px-4 py-3 font-mono text-blue-600 text-xs">{c.rollNumber}</td>
                        <td className="px-4 py-3 text-gray-600">{c.courseName || '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs text-indigo-600">{c.certificateNo}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{c.issueDate ? new Date(c.issueDate).toLocaleDateString('en-IN') : '—'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => { setViewItem(c); setViewType('certificate'); }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors">
                            <Eye className="w-3.5 h-3.5" /> View
                          </button>
                        </td>
                      </tr>
                    ))}
                    {certificates.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-12 text-gray-400">No certificates found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewItem && (
        <ViewModal
          title={viewType === 'student' ? 'Student Details' : viewType === 'admission' ? 'Admission Details' : viewType === 'result' ? 'Result Details' : 'Certificate Details'}
          data={viewItem}
          fields={viewType === 'student' ? studentFields : viewType === 'admission' ? admissionFields : viewType === 'result' ? resultFields : certFields}
          onClose={() => setViewItem(null)}
        />
      )}
    </div>
  );
}
