import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, X, Save, Pencil, Search, Download, FileText } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/Loader';

const COURSES = [
  'Certificate In Fundamental (CIF)', 'Certificate in Computer Application (CCA)',
  'Certificate In Office Package & Tally A/C (COPT)', 'Tally Specialist Course With GST',
  'Advance Diploma in Computer Application (ADCA)', 'Desktop Publishing (DTP)',
  'Computer Teacher Training Course', 'Certificate In Computer Hardware (CICH)',
  'JAVA, VB.net, ASP.net, PHP', 'Computer Typing (Hindi + English)', 'C, C++ Programming',
  'Diploma in Computer Application (DCA)', 'Certificate In Tally A/c With GST (CIT)',
  'Multimedia Animation Course (N-Mass)', 'BCA / BBA / MCA / MBA / PGDCA & More',
  'Course On Computer Concept (CCC from NIELIT)',
];

const inp = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

const emptyForm = {
  studentId: '', studentName: '', fatherName: '', courseName: '',
  branch: '', batch: '', rollNumber: '', formNo: '', examDate: '', uploadDate: '', resultFile: null,
};

function ResultModal({ title, form, setForm, students, saving, onSubmit, onClose }) {
  const [query, setQuery] = useState('');
  const [showDrop, setShowDrop] = useState(false);

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase()) ||
    (s.rollNumber || '').toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10);

  const selectStudent = (s) => {
    setForm(f => ({
      ...f,
      studentId: s._id,
      studentName: s.name,
      fatherName: s.fatherName || '',
      courseName: s.courseName || '',
      branch: s.branchName || '',
      batch: s.batch || '',
      rollNumber: s.rollNumber || '',
      formNo: s.formNo || '',
    }));
    setQuery(s.name);
    setShowDrop(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-blue-600 to-indigo-600 sticky top-0 z-10">
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-white/80 hover:text-white" /></button>
        </div>
        <form onSubmit={onSubmit} className="p-5 space-y-4">

          {/* Student Auto-Selector */}
          <div className="relative">
            <label className="block text-xs font-medium text-gray-700 mb-1">Student Name *</label>
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); setShowDrop(true); }}
              onFocus={() => setShowDrop(true)}
              placeholder="Search student name or roll no..."
              className={inp}
              autoComplete="off"
            />
            {showDrop && query.length > 0 && filtered.length > 0 && (
              <div className="absolute z-20 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                {filtered.map(s => (
                  <button key={s._id} type="button" onMouseDown={() => selectStudent(s)}
                    className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm border-b border-gray-50 last:border-0">
                    <div className="font-semibold text-gray-900">{s.name}</div>
                    <div className="text-xs text-gray-400">{s.rollNumber} | {s.courseName}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Father's Name</label>
              <input value={form.fatherName} onChange={e => setForm(f => ({ ...f, fatherName: e.target.value }))} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Course</label>
              <select value={form.courseName} onChange={e => setForm(f => ({ ...f, courseName: e.target.value }))} className={inp}>
                <option value="">-- Select --</option>
                {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Branch</label>
              <input value={form.branch} onChange={e => setForm(f => ({ ...f, branch: e.target.value }))} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Session / Batch</label>
              <input value={form.batch} onChange={e => setForm(f => ({ ...f, batch: e.target.value }))} placeholder="e.g. 2024-25" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Roll Number</label>
              <input value={form.rollNumber} onChange={e => setForm(f => ({ ...f, rollNumber: e.target.value }))} placeholder="Auto-filled" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Form No</label>
              <input value={form.formNo} onChange={e => setForm(f => ({ ...f, formNo: e.target.value }))} placeholder="Auto-filled" className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Exam Date</label>
              <input type="date" value={form.examDate} onChange={e => setForm(f => ({ ...f, examDate: e.target.value }))} className={inp} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Upload Date</label>
              <input type="date" value={form.uploadDate} onChange={e => setForm(f => ({ ...f, uploadDate: e.target.value }))} className={inp} />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Result File (PDF / PNG / JPEG)</label>
            <input type="file" accept=".pdf,.png,.jpg,.jpeg"
              onChange={e => setForm(f => ({ ...f, resultFile: e.target.files[0] }))}
              className="w-full text-sm text-gray-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-blue-50 file:text-blue-700 file:font-semibold hover:file:bg-blue-100 cursor-pointer" />
            {form.resultFile && typeof form.resultFile === 'string' && (
              <a href={form.resultFile} target="_blank" rel="noreferrer" className="text-xs text-blue-600 mt-1 flex items-center gap-1">
                <FileText className="w-3 h-3" /> View current file
              </a>
            )}
          </div>

          <button type="submit" disabled={saving || !form.studentName}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : 'Save Result'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function AdminResults() {
  const [results, setResults] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchResults();
    api.get('/results/students').then(r => setStudents(r.data.students || [])).catch(() => {});
  }, []);

  const fetchResults = async () => {
    try {
      const { data } = await api.get('/results');
      setResults(data.results || []);
    } catch {}
    setLoading(false);
  };

  const filtered = results.filter(r =>
    [r.studentName, r.rollNumber, r.courseName, r.branch].join(' ').toLowerCase().includes(search.toLowerCase())
  );

  const buildFormData = (f) => {
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => {
      if (k === 'resultFile' && v instanceof File) fd.append('resultFile', v);
      else if (k !== 'resultFile' && v !== null && v !== undefined) fd.append(k, v);
    });
    return fd;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.studentName) return toast.error('Select a student');
    setSaving(true);
    try {
      await api.post('/results', buildFormData(form), { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Result added!');
      setAddModal(false);
      fetchResults();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const openEdit = (r) => {
    setEditId(r._id);
    setForm({
      studentId: r.studentId || '',
      studentName: r.studentName || '',
      fatherName: r.fatherName || '',
      courseName: r.courseName || '',
      branch: r.branch || '',
      batch: r.batch || '',
      rollNumber: r.rollNumber || '',
      formNo: r.formNo || '',
      examDate: r.examDate ? new Date(r.examDate).toISOString().split('T')[0] : '',
      uploadDate: r.uploadDate ? new Date(r.uploadDate).toISOString().split('T')[0] : '',
      resultFile: r.resultFile || null,
    });
    setEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/results/${editId}`, buildFormData(form), { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Result updated!');
      setEditModal(false);
      fetchResults();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this result?')) return;
    try { await api.delete(`/results/${id}`); toast.success('Deleted'); fetchResults(); } catch { toast.error('Error'); }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <h1 className="text-xl font-bold text-gray-900">Results</h1>
        <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 py-2 flex-1 min-w-[160px] max-w-xs">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, roll no..."
            className="bg-transparent text-sm outline-none flex-1" />
          {search && <button onClick={() => setSearch('')}><X className="w-3.5 h-3.5 text-gray-400" /></button>}
        </div>
        <button onClick={() => { setForm(emptyForm); setAddModal(true); }}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Result
        </button>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>{['Student', 'Course', 'Branch / Batch', 'Exam Date', 'File', 'Actions'].map(h => (
                <th key={h} className="text-left p-4 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="font-medium text-gray-900">{r.studentName}</div>
                    {r.fatherName && <div className="text-xs text-gray-400">{r.fatherName}</div>}
                  </td>
                  <td className="p-4 text-xs text-gray-600 max-w-[140px] truncate">{r.courseName || '—'}</td>
                  <td className="p-4 text-xs">
                    <div className="text-gray-600">{r.branch || '—'}</div>
                    <div className="text-gray-400">{r.batch || '—'}</div>
                  </td>
                  <td className="p-4 text-xs text-gray-500">
                    {r.examDate ? new Date(r.examDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="p-4">
                    {r.resultFile
                      ? <a href={r.resultFile} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-semibold">
                          <FileText className="w-3.5 h-3.5" /> View
                        </a>
                      : <span className="text-xs text-gray-400">No file</span>
                    }
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openEdit(r)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(r._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-400">No results found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {addModal && <ResultModal title="Add Result" form={form} setForm={setForm} students={students} saving={saving} onSubmit={handleAdd} onClose={() => setAddModal(false)} />}
      {editModal && <ResultModal title="Edit Result" form={form} setForm={setForm} students={students} saving={saving} onSubmit={handleEdit} onClose={() => setEditModal(false)} />}
    </div>
  );
}
