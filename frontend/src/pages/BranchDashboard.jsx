import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Building2, Users, ClipboardList, Award, FileText, LogOut,
  TrendingUp, BookOpen, CheckCircle, Clock, Search, Eye, X,
  Plus, Pencil, Trash2, Check, UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const tabs = [
  { id: 'overview', label: 'Overview', icon: TrendingUp },
  { id: 'students', label: 'Students', icon: Users },
  { id: 'results', label: 'Results', icon: Award },
  { id: 'certificates', label: 'Certificates', icon: FileText },
];

const EMPTY_STUDENT = { name: '', email: '', phone: '', fatherName: '', dob: '', address: '', courseName: '', batch: '' };

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

function StudentForm({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState(initial);
  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));
  const fields = [
    { name: 'name', label: 'Full Name *', placeholder: 'Student full name' },
    { name: 'email', label: 'Email *', placeholder: 'student@email.com', type: 'email' },
    { name: 'phone', label: 'Phone', placeholder: '10-digit mobile' },
    { name: 'fatherName', label: "Father's Name", placeholder: "Father's full name" },
    { name: 'courseName', label: 'Course Name', placeholder: 'e.g. DCA, ADCA, Tally' },
    { name: 'batch', label: 'Batch', placeholder: 'e.g. 2024-25' },
    { name: 'dob', label: 'Date of Birth', type: 'date' },
  ];
  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        {fields.map(({ name, label, placeholder, type = 'text' }) => (
          <div key={name} className={`space-y-1 ${name === 'name' || name === 'email' ? 'col-span-2' : ''}`}>
            <label className="text-xs font-semibold text-gray-600">{label}</label>
            <input name={name} type={type} value={form[name] || ''} onChange={set} placeholder={placeholder}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all" />
          </div>
        ))}
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">Address</label>
        <textarea name="address" value={form.address || ''} onChange={set} rows={2} placeholder="Full address"
          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all resize-none" />
      </div>
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
  return (
    <Modal title={title} onClose={onClose}>
      <div className="space-y-2.5">
        {fields.map(([label, key]) => (
          <div key={key} className="flex justify-between items-start gap-4 py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs font-semibold text-gray-400 shrink-0 w-28">{label}</span>
            <span className="text-sm text-gray-800 font-medium text-right">{data[key] || '—'}</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}

export default function BranchDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [results, setResults] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState('');
  const [viewItem, setViewItem] = useState(null);
  const [viewType, setViewType] = useState('');

  const loadData = () => {
    api.get('/branch/dashboard-stats').then(r => setStats(r.data.stats)).catch(() => {});
    api.get('/branch/students').then(r => setStudents(r.data.students || [])).catch(() => {});
    api.get('/branch/results').then(r => setResults(r.data.results || [])).catch(() => {});
    api.get('/branch/certificates').then(r => setCertificates(r.data.certificates || [])).catch(() => {});
  };

  useEffect(() => {
    if (!user || user.role !== 'branch') { navigate('/login'); return; }
    loadData();
  }, [user]);

  const handleLogout = () => { logout(); navigate('/'); };

  const handleAddStudent = async form => {
    if (!form.name || !form.email) return toast.error('Name and email required');
    setSaving(true);
    try {
      const r = await api.post('/branch/students', form);
      setStudents(p => [r.data.student, ...p]);
      setModal(null);
      toast.success('Student added! Approve to send login credentials.');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleEditStudent = async form => {
    setSaving(true);
    try {
      const r = await api.put(`/branch/students/${selected._id}`, form);
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

  const filtered = (list, keys) => {
    if (!search) return list;
    const q = search.toLowerCase();
    return list.filter(item => keys.some(k => item[k]?.toString().toLowerCase().includes(q)));
  };

  const studentFields = [['Name', 'name'], ['Email', 'email'], ['Phone', 'phone'], ['Roll No', 'rollNumber'], ['Course', 'courseName'], ['Batch', 'batch'], ['Father', 'fatherName'], ['DOB', 'dob'], ['Address', 'address'], ['Status', 'isActive']];
  const resultFields = [['Student', 'studentName'], ['Roll No', 'rollNumber'], ['Course', 'courseName'], ['Total Marks', 'totalMarks'], ['Obtained', 'obtainedMarks'], ['Percentage', 'percentage'], ['Grade', 'grade'], ['Status', 'status']];
  const certFields = [['Student', 'studentName'], ['Roll No', 'rollNumber'], ['Course', 'courseName'], ['Cert No', 'certificateNumber'], ['Grade', 'grade'], ['Issue Date', 'issueDate']];

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
            <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setActiveTab(id); setSearch(''); }}
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
                { icon: CheckCircle, label: 'Active', value: stats?.active, color: 'bg-green-500', delay: 0.05 },
                { icon: ClipboardList, label: 'Admissions', value: stats?.admissions, color: 'bg-orange-500', delay: 0.1 },
                { icon: BookOpen, label: 'Courses', value: stats?.courses, color: 'bg-violet-500', delay: 0.15 },
                { icon: Award, label: 'Results', value: stats?.results, color: 'bg-yellow-500', delay: 0.2 },
                { icon: FileText, label: 'Certificates', value: stats?.certificates, color: 'bg-teal-500', delay: 0.25 },
              ].map(s => <StatCard key={s.label} {...s} />)}
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" /> Branch Information
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {[['Branch Name', user?.branchName], ['Branch Code', user?.branchCode], ['City', user?.branchCity],
                  ['Phone', user?.phone || '—'], ['Email', user?.email], ['Address', user?.branchAddress || '—']
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
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white w-48" />
                </div>
                <button onClick={() => { setSelected(null); setModal('add'); }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md">
                  <Plus className="w-4 h-4" /> Add Student
                </button>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>{['Name', 'Roll No', 'Course', 'Phone', 'Status', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filtered(students, ['name', 'rollNumber', 'courseName', 'phone']).map(s => (
                      <tr key={s._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-gray-900">{s.name}</div>
                          <div className="text-xs text-gray-400">{s.email}</div>
                        </td>
                        <td className="px-4 py-3 font-mono text-blue-600 text-xs">{s.rollNumber || '—'}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{s.courseName || '—'}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{s.phone || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${s.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {s.isApproved ? 'Approved' : 'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => { setViewItem(s); setViewType('student'); }}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors" title="View">
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => { setSelected(s); setModal('edit'); }}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-lg transition-colors" title="Edit">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            {!s.isApproved && (
                              <button onClick={() => handleApprove(s._id)} disabled={approving === s._id}
                                className="p-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors disabled:opacity-50" title="Approve & Send Email">
                                {approving === s._id ? <div className="w-3.5 h-3.5 border-2 border-green-600 border-t-transparent rounded-full animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              </button>
                            )}
                            <button onClick={() => handleDelete(s._id, s.name)}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors" title="Delete">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {students.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-16 text-gray-400">
                        <Users className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                        No students yet. Click "Add Student" to get started.
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending approvals banner */}
            {students.filter(s => !s.isApproved).length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-600 shrink-0" />
                <p className="text-sm text-yellow-800 font-medium">
                  <strong>{students.filter(s => !s.isApproved).length}</strong> student(s) pending approval. Click ✓ to approve and send login credentials via email.
                </p>
              </div>
            )}
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
                      <tr key={r._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{r.studentName}</td>
                        <td className="px-4 py-3 font-mono text-blue-600 text-xs">{r.rollNumber}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{r.courseName || '—'}</td>
                        <td className="px-4 py-3 text-gray-600">{r.obtainedMarks ?? '—'}/{r.totalMarks ?? '—'}</td>
                        <td className="px-4 py-3 font-bold text-indigo-600">{r.grade || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${r.status === 'Pass' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{r.status || '—'}</span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => { setViewItem(r); setViewType('result'); }}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {results.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-gray-400">No results found</td></tr>}
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
                    <tr>{['Student', 'Roll No', 'Course', 'Certificate No', 'Grade', 'Issue Date', 'Action'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-gray-500 uppercase tracking-wide">{h}</th>
                    ))}</tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {certificates.map(c => (
                      <tr key={c._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-900">{c.studentName}</td>
                        <td className="px-4 py-3 font-mono text-blue-600 text-xs">{c.rollNumber}</td>
                        <td className="px-4 py-3 text-gray-600 text-xs">{c.courseName || '—'}</td>
                        <td className="px-4 py-3 font-mono text-xs text-indigo-600">{c.certificateNumber}</td>
                        <td className="px-4 py-3 font-bold text-green-600">{c.grade || '—'}</td>
                        <td className="px-4 py-3 text-gray-400 text-xs">{c.issueDate ? new Date(c.issueDate).toLocaleDateString('en-IN') : '—'}</td>
                        <td className="px-4 py-3">
                          <button onClick={() => { setViewItem(c); setViewType('certificate'); }}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {certificates.length === 0 && <tr><td colSpan={7} className="text-center py-12 text-gray-400">No certificates found</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
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
      </AnimatePresence>

      {viewItem && (
        <ViewModal
          title={viewType === 'student' ? 'Student Details' : viewType === 'result' ? 'Result Details' : 'Certificate Details'}
          data={viewItem}
          fields={viewType === 'student' ? studentFields : viewType === 'result' ? resultFields : certFields}
          onClose={() => setViewItem(null)}
        />
      )}
    </div>
  );
}
