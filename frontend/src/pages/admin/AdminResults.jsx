import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, X, Save, Pencil, Upload, Search, Download, Hash, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';

const COURSES = [
  'Certificate In Fundamental (CIF)', 'Certificate in Computer Application (CCA)',
  'Certificate In Office Package & Tally A/C (COPT)', 'Tally Specialist Course With GST',
  'Advance Diploma in Computer Application (ADCA)', 'Desktop Publishing (DTP)',
  'Computer Teacher Training Course', 'I.G.D. Bombay', 'Certificate In Computer Hardware (CICH)',
  'JAVA, VB.net, ASP.net, PHP', 'Computer Typing (Hindi + English)', 'C, C++ Programming',
  'Internet Course', 'Diploma in Computer Application (DCA)', 'Certificate In Tally A/c With GST (CIT)',
  'Personality Development', 'Diploma in Yoga Education (DYEd./DYT)',
  'PG Diploma In Yoga Education (PGDYEd.)', 'Multimedia Animation Course (N-Mass)',
  'BCA / BBA / MCA / MBA / PGDCA & More', 'Course On Computer Concept (CCC from NIELIT)',
];

const SUBJECTS = [
  'Computer Competency', 'MS DOS', 'Windows XP/07/10', 'MS Word 2007/2010', 'MS Excel 2007/2010',
  'MS PowerPoint 2007/2010', 'MS Access 2007/2010', 'Information Technology', 'I/O System',
  'Storage Technology', 'Basic of Multimedia', 'Printing Technology', 'Hardware Concept',
  'Internet', 'Tally Prime With GST', 'GST Filing', 'Accounting Basics', 'Payroll Management',
  'Inventory Management', 'Banking & Finance', 'Web Technology', 'Networking Concept', 'PageMaker',
  'Corel Draw', 'Photoshop', 'C Language', 'Python Programming', 'HTML', 'JavaScript', 'VB Script',
  'Project', 'Graphic Design Fundamentals', 'Print Media', 'Digital Design',
  'Fundamental of Computer Hardware', 'Basic Electronic & Maintenance', 'Number System',
  'Architecture & Operating System', 'Computer Peripheral & Device', 'Computer Assembling',
  'Hard Disk Partition', 'Software Installation', 'Troubleshooting', 'Java Programming',
  'VB.net', 'ASP.net', 'PHP', 'Web Development', 'Hindi Typing', 'English Typing',
  'C Language Basics', 'Control Structures', 'Functions & Arrays', 'Pointers', 'C++ OOP Concepts',
  'Classes & Objects', 'Inheritance', 'Internet Basics', 'Web Browsing', 'Email', 'Online Services',
  'Communication Skills', 'Confidence Building', 'Interview Preparation', 'Soft Skills',
  'Yoga Philosophy', 'Asanas & Pranayama', 'Meditation', 'Anatomy', 'Teaching Methodology',
  '2D Animation', '3D Animation', 'Video Editing', 'VFX Basics', 'Multimedia Production',
  'Operating System', 'Elements of Word Processing', 'Spread Sheet',
  'Introduction to Internet & Web Browser', 'Communication & Collaboration',
  'Applications of Presentation', 'Applications of Digital Financial Service',
  'Computer Fundamentals', 'MS Office', 'MS Office Suite',
];

const emptySub = { name: '', maxMarks: '', obtainedMarks: '' };
const emptyForm = {
  formNo: '', enrollmentNumber: '', rollNumber: '',
  studentName: '', fatherName: '', courseName: '', branch: '',
  batch: '', examDate: '', uploadDate: '', subjects: [{ ...emptySub }],
};

const inp = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

function ResultForm({ form, setForm, lookingUp, onLookup, saving, onSubmit, onClose, title }) {
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addSub = () => setForm(f => ({ ...f, subjects: [...f.subjects, { ...emptySub }] }));
  const removeSub = i => setForm(f => ({ ...f, subjects: f.subjects.filter((_, idx) => idx !== i) }));
  const updateSub = (i, k, v) => setForm(f => ({ ...f, subjects: f.subjects.map((s, idx) => idx === i ? { ...s, [k]: v } : s) }));

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-blue-600 to-indigo-600 sticky top-0 z-10">
          <div>
            <h2 className="text-lg font-bold text-white">{title}</h2>
            <p className="text-blue-100 text-xs mt-0.5">Enter Form No or Enrollment No to auto-fill</p>
          </div>
          <button type="button" onClick={onClose}><X className="w-5 h-5 text-white/80 hover:text-white" /></button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">
          {/* Identifiers */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-blue-700 flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" /> Student Identifiers (auto-fetch on blur)</p>
            <div className="grid grid-cols-2 gap-3">
              {[['formNo', 'Form Number', 'e.g. KCI/FORM/2025/0001'], ['enrollmentNumber', 'Enrollment Number', 'e.g. KC2500145']].map(([key, label, ph]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <div className="relative">
                    <input value={form[key]} onChange={e => setF(key, e.target.value)}
                      onBlur={e => onLookup(key, e.target.value)} placeholder={ph}
                      className={inp + ' pr-8'} />
                    {lookingUp && <RefreshCw className="absolute right-2 top-2.5 w-4 h-4 text-blue-400 animate-spin" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Student Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Student Name *</label>
              <input value={form.studentName} onChange={e => setF('studentName', e.target.value)} required className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Father's Name</label>
              <input value={form.fatherName} onChange={e => setF('fatherName', e.target.value)} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Course</label>
              <select value={form.courseName} onChange={e => setF('courseName', e.target.value)} className={inp + ' bg-white'}>
                <option value="">-- Select --</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Branch</label>
              <input value={form.branch} onChange={e => setF('branch', e.target.value)} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Session / Batch</label>
              <input value={form.batch} onChange={e => setF('batch', e.target.value)} placeholder="e.g. 2024-25" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Exam Date</label>
              <input type="date" value={form.examDate} onChange={e => setF('examDate', e.target.value)} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Upload Date</label>
              <input type="date" value={form.uploadDate} onChange={e => setF('uploadDate', e.target.value)} className={inp} />
            </div>
          </div>

          {/* Subjects */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">Subject Marks</label>
              <button type="button" onClick={addSub} className="text-xs text-blue-600 hover:underline font-medium">+ Add Subject</button>
            </div>
            {form.subjects.map((s, i) => (
              <div key={i} className="flex gap-2 mb-2 items-center">
                <select value={s.name} onChange={e => updateSub(i, 'name', e.target.value)}
                  className="flex-1 px-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">-- Subject --</option>
                  {SUBJECTS.map(sub => <option key={sub} value={sub}>{sub}</option>)}
                </select>
                <input placeholder="Max" type="number" min="0" value={s.maxMarks} onChange={e => updateSub(i, 'maxMarks', e.target.value)}
                  className="w-16 px-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                <input placeholder="Got" type="number" min="0" value={s.obtainedMarks} onChange={e => updateSub(i, 'obtainedMarks', e.target.value)}
                  className="w-16 px-2 py-2 border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                {form.subjects.length > 1 && (
                  <button type="button" onClick={() => removeSub(i)} className="text-red-400 hover:text-red-600 shrink-0"><X className="w-4 h-4" /></button>
                )}
              </div>
            ))}
          </div>

          <button type="submit" disabled={saving}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Result'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminResults() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);
  const [editLookingUp, setEditLookingUp] = useState(false);
  const [search, setSearch] = useState('');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth());
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => { fetchResults(); }, []);

  const fetchResults = async () => {
    try {
      const { data } = await api.get('/results');
      setResults(data.results || []);
    } catch {}
    setLoading(false);
  };

  const now = new Date();
  const filtered = results.filter(r => {
    const matchSearch = [r.rollNumber, r.formNo, r.enrollmentNumber, r.studentName, r.fatherName, r.courseName, r.branch]
      .join(' ').toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    const d = new Date(r.createdAt);
    if (filterPeriod === 'yearly') return d.getFullYear() === Number(filterYear);
    if (filterPeriod === 'monthly') return d.getFullYear() === Number(filterYear) && d.getMonth() === Number(filterMonth);
    if (filterPeriod === 'weekly') { const w = new Date(now); w.setDate(now.getDate() - 7); return d >= w; }
    return true;
  });

  const lookupStudent = useCallback(async (field, value, isEdit = false) => {
    if (!value || value.length < 3) return;
    isEdit ? setEditLookingUp(true) : setLookingUp(true);
    try {
      const params = field === 'formNo' ? { formNo: value } : { enrollmentNumber: value };
      const { data } = await api.get('/results/lookup-student', { params });
      if (data.success && data.student) {
        const patch = {
          studentName: data.student.name,
          fatherName: data.student.fatherName,
          courseName: data.student.courseName,
          batch: data.student.batch,
          branch: data.student.branch,
          rollNumber: data.student.rollNumber,
          enrollmentNumber: data.student.enrollmentNumber,
          formNo: data.student.formNo,
        };
        if (isEdit) setEditForm(f => ({ ...f, ...patch }));
        else setForm(f => ({ ...f, ...patch }));
        toast.success(`Student found: ${data.student.name}`);
      }
    } catch {}
    isEdit ? setEditLookingUp(false) : setLookingUp(false);
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.studentName) return toast.error('Student name is required');
    if (!form.formNo && !form.enrollmentNumber && !form.rollNumber) return toast.error('Provide Form No, Enrollment No, or Roll No');
    setSaving(true);
    try {
      await api.post('/results', form);
      toast.success('Result added');
      setAddModal(false);
      fetchResults();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving result'); }
    setSaving(false);
  };

  const openEdit = (r) => {
    setEditId(r._id);
    setEditForm({
      formNo: r.formNo || '',
      enrollmentNumber: r.enrollmentNumber || '',
      rollNumber: r.rollNumber || '',
      studentName: r.studentName || '',
      fatherName: r.fatherName || '',
      courseName: r.courseName || '',
      branch: r.branch || r.branchName || '',
      batch: r.batch || r.session || '',
      examDate: r.examDate ? new Date(r.examDate).toISOString().split('T')[0] : '',
      uploadDate: r.uploadDate ? new Date(r.uploadDate).toISOString().split('T')[0] : '',
      subjects: r.subjects?.length ? r.subjects.map(s => ({ name: s.name || '', maxMarks: s.maxMarks || '', obtainedMarks: s.obtainedMarks || '' })) : [{ ...emptySub }],
    });
    setEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.studentName) return toast.error('Student name is required');
    setSaving(true);
    try {
      await api.put(`/results/${editId}`, editForm);
      toast.success('Result updated');
      setEditModal(false);
      fetchResults();
    } catch (err) { toast.error(err.response?.data?.message || 'Error updating result'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this result?')) return;
    try { await api.delete(`/results/${id}`); toast.success('Deleted'); fetchResults(); } catch { toast.error('Error'); }
  };

  const exportExcel = () => {
    const rows = filtered.map(r => ({
      'Form No': r.formNo || '', 'Enrollment No': r.enrollmentNumber || '', 'Roll No': r.rollNumber || '',
      'Student': r.studentName, 'Father': r.fatherName || '', 'Course': r.courseName || '',
      'Branch': r.branch || r.branchName || '', 'Session': r.batch || r.session || '',
      'Obtained': r.obtainedMarks, 'Total': r.totalMarks,
      'Percentage': (r.percentage || 0) + '%', 'Grade': r.grade, 'Status': r.status,
      'Exam Date': r.examDate ? new Date(r.examDate).toLocaleDateString('en-IN') : '',
      'Upload Date': r.uploadDate ? new Date(r.uploadDate).toLocaleDateString('en-IN') : '',
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Results');
    XLSX.writeFile(wb, `KCI_Results_${Date.now()}.xlsx`);
    toast.success('Exported!');
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Results</h1>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-[160px] max-w-xs focus-within:border-blue-500 transition-all">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search form no, name, enrollment..."
            className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder:text-gray-400" />
          {search && <button type="button" onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-400" /></button>}
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {['all', 'Pass', 'Fail'].map(s => (
            <button key={s} type="button" onClick={() => setFilterStatus(s)}
              className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === s ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {s === 'all' ? 'All Status' : s}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {['all', 'weekly', 'monthly', 'yearly'].map(p => (
            <button key={p} type="button" onClick={() => setFilterPeriod(p)}
              className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filterPeriod === p ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
        {(filterPeriod === 'yearly' || filterPeriod === 'monthly') && (
          <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
            className="px-2 py-1.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none">
            {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        )}
        {filterPeriod === 'monthly' && (
          <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}
            className="px-2 py-1.5 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none">
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <button type="button" onClick={exportExcel} className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-emerald-700 transition-colors">
            <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export</span>
          </button>
          <button type="button" onClick={() => { setForm(emptyForm); setAddModal(true); }}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Result</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total Results', value: results.length, color: 'text-blue-700', bg: 'bg-blue-50' },
          { label: 'Pass', value: results.filter(r => r.status === 'Pass').length, color: 'text-green-700', bg: 'bg-green-50' },
          { label: 'Fail', value: results.filter(r => r.status === 'Fail').length, color: 'text-red-700', bg: 'bg-red-50' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-3 text-center border border-gray-100`}>
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>{['Form No / Enroll', 'Student', 'Course', 'Branch / Session', 'Marks', 'Grade', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left p-4 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    {r.formNo && <div className="font-mono text-xs text-purple-700 font-semibold">{r.formNo}</div>}
                    {r.enrollmentNumber && <div className="font-mono text-xs text-blue-700">{r.enrollmentNumber}</div>}
                    {r.rollNumber && <div className="font-mono text-xs text-gray-400">{r.rollNumber}</div>}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{r.studentName}</div>
                    {r.fatherName && <div className="text-xs text-gray-400">{r.fatherName}</div>}
                  </td>
                  <td className="p-4 text-gray-600 text-xs max-w-[140px] truncate">{r.courseName || r.course?.title || '—'}</td>
                  <td className="p-4 text-xs">
                    <div className="text-gray-600">{r.branch || r.branchName || '—'}</div>
                    <div className="text-gray-400">{r.batch || r.session || '—'}</div>
                  </td>
                  <td className="p-4 text-xs">
                    <div className="font-semibold text-blue-700">{r.percentage || 0}%</div>
                    <div className="text-gray-400">{r.obtainedMarks}/{r.totalMarks}</div>
                  </td>
                  <td className="p-4"><span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-bold">{r.grade || '—'}</span></td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${r.status === 'Pass' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {r.status || '—'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => openEdit(r)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                      {isAdmin && <button type="button" onClick={() => handleDelete(r._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-gray-500">No results found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {addModal && (
        <ResultForm
          form={form} setForm={setForm}
          lookingUp={lookingUp}
          onLookup={(field, val) => lookupStudent(field, val, false)}
          saving={saving} onSubmit={handleAdd}
          onClose={() => setAddModal(false)}
          title="Add Result"
        />
      )}

      {/* Edit Modal */}
      {editModal && (
        <ResultForm
          form={editForm} setForm={setEditForm}
          lookingUp={editLookingUp}
          onLookup={(field, val) => lookupStudent(field, val, true)}
          saving={saving} onSubmit={handleEdit}
          onClose={() => setEditModal(false)}
          title="Edit Result"
        />
      )}
    </div>
  );
}
