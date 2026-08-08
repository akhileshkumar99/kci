import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Plus, Trash2, X, Save, Edit2, FileText, Award, Calendar, Hash, User, BookOpen, Upload, Eye, Search, ChevronDown } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/Loader';

const API_URL = import.meta.env.VITE_API_URL || '';
const today = () => new Date().toISOString().split('T')[0];
const emptyForm = { formNo: '', enrollmentNumber: '', rollNumber: '', studentName: '', courseName: '', certificateNumber: '', issueDate: today(), grade: '' };

function StudentSelector({ onSelect }) {
  const [query, setQuery] = useState('');
  const [students, setStudents] = useState([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setStudents([]); setOpen(false); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get(`/admin/students/search?q=${encodeURIComponent(query)}&limit=10`);
        setStudents(data.students || []);
        setOpen(true);
      } catch { setStudents([]); }
      setSearching(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const pick = (s) => {
    onSelect(s);
    setQuery(s.name);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Select Student <span className="text-xs font-normal text-gray-400">(search to auto-fill fields)</span></label>
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        {searching && <div className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />}
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); }}
          onFocus={() => students.length > 0 && setOpen(true)}
          placeholder="Search by name, form no, enrollment no..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 focus:bg-white transition-colors"
        />
      </div>
      {open && students.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
          {students.map(s => (
            <button key={s._id} type="button" onClick={() => pick(s)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-gray-50 last:border-0">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 text-blue-700 font-black text-sm">
                {s.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">{s.name}</p>
                <p className="text-xs text-gray-400 truncate">
                  {s.formNo || s.enrollmentNumber || s.rollNumber} · {s.courseName}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
      {open && students.length === 0 && query.trim() && !searching && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl px-4 py-3 text-sm text-gray-400">
          No students found
        </div>
      )}
    </div>
  );
}

export default function AdminCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [certFile, setCertFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { fetchCerts(); }, []);

  const fetchCerts = async () => {
    try { const { data } = await api.get('/certificates'); setCerts(data.certificates); } catch {}
    setLoading(false);
  };

  const handleStudentSelect = (s) => {
    setForm(prev => ({
      ...prev,
      formNo: s.formNo || '',
      enrollmentNumber: s.enrollmentNumber || '',
      rollNumber: s.rollNumber || '',
      studentName: s.name || '',
      courseName: s.courseName || '',
    }));
  };

  const openAdd = () => { setForm({ ...emptyForm, issueDate: today() }); setCertFile(null); setEditing(null); setModal(true); };
  const openEdit = (c) => {
    setForm({
      formNo: c.formNo || '',
      enrollmentNumber: c.enrollmentNumber || '',
      rollNumber: c.rollNumber || '',
      studentName: c.studentName,
      courseName: c.courseName,
      certificateNumber: c.certificateNumber,
      grade: c.grade || '',
      issueDate: c.issueDate ? new Date(c.issueDate).toISOString().split('T')[0] : today(),
    });
    setCertFile(null); setEditing(c._id); setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.formNo || !form.studentName || !form.certificateNumber || !form.issueDate)
      return toast.error('Fill all required fields');
    if (!editing && !certFile)
      return toast.error('Please upload the certificate file');
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (certFile) fd.append('certificateFile', certFile);
      if (editing) { await api.put(`/certificates/${editing}`, fd); toast.success('Certificate updated'); }
      else { await api.post('/certificates', fd); toast.success('Certificate issued & student notified'); }
      setModal(false); fetchCerts();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this certificate?')) return;
    try { await api.delete(`/certificates/${id}`); toast.success('Deleted'); fetchCerts(); }
    catch { toast.error('Error'); }
  };

  const fields = [
    { name: 'formNo', label: 'Form No / Enrollment No', icon: Hash, placeholder: 'e.g. 2026010008', required: true },
    { name: 'studentName', label: 'Student Name', icon: User, placeholder: 'Full name', required: true },
    { name: 'courseName', label: 'Course Name', icon: BookOpen, placeholder: 'e.g. DCA', required: true },
    { name: 'certificateNumber', label: 'Certificate Number', icon: Award, placeholder: 'e.g. KCI/2026/DCA/0001', required: true },
    { name: 'grade', label: 'Grade', icon: Award, placeholder: 'e.g. A, B+, S', required: false },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Certificates</h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{certs.length} certificate{certs.length !== 1 ? 's' : ''} issued</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-blue-700 transition-colors shadow-sm">
          <Plus className="w-4 h-4" /> <span className="hidden sm:inline">Issue Certificate</span><span className="sm:hidden">Issue</span>
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
        <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Manual Certificate Upload</p>
          <p className="text-xs text-blue-600 mt-0.5">Upload the certificate file (PDF/Image) for each student. The certificate will be visible to the student only after you upload it.</p>
        </div>
      </div>

      {/* Certificates Table */}
      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Certificate No.', 'Student', 'Form No.', 'Course', 'Grade', 'Issue Date', 'File', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {certs.map((c) => (
                <tr key={c._id} className="border-t border-gray-100 hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="font-mono text-xs text-blue-700 font-semibold">{c.certificateNumber}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 font-medium text-gray-900">{c.studentName}</td>
                  <td className="px-4 py-3.5"><span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-mono">{c.formNo || c.rollNumber || '—'}</span></td>
                  <td className="px-4 py-3.5 text-gray-600 max-w-[160px] truncate">{c.courseName}</td>
                  <td className="px-4 py-3.5">
                    {c.grade ? <span className="px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-bold border border-green-100">{c.grade}</span> : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 text-xs">{new Date(c.issueDate).toLocaleDateString('en-IN')}</td>
                  <td className="px-4 py-3.5">
                    {c.certificateFile
                      ? <a href={`${API_URL}${c.certificateFile}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-green-600 font-semibold hover:underline"><Eye className="w-3.5 h-3.5" /> View</a>
                      : <span className="text-xs text-red-400 font-semibold">Not uploaded</span>
                    }
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(c)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(c._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {certs.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-16 text-center text-gray-400">
                  <Award className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                  <p className="font-medium">No certificates issued yet</p>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Issue/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-blue-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Award className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-base font-bold text-white">{editing ? 'Edit Certificate' : 'Issue Certificate'}</h2>
              </div>
              <button onClick={() => setModal(false)} className="text-white/70 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* Student selector — only for new certificates */}
              {!editing && (
                <>
                  <StudentSelector onSelect={handleStudentSelect} />
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-gray-100" />
                    <span className="text-xs text-gray-400 font-medium">or fill manually</span>
                    <div className="flex-1 h-px bg-gray-100" />
                  </div>
                </>
              )}
              {fields.map(({ name, label, icon: Icon, placeholder, required }) => (
                <div key={name}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label} {required && <span className="text-red-500">*</span>}</label>
                  <div className="relative">
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input value={form[name]} onChange={(e) => setForm({ ...form, [name]: e.target.value })} placeholder={placeholder}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors" />
                  </div>
                </div>
              ))}

              {/* Issue Date — auto-captured, editable */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Issue Date <span className="text-red-500">*</span>
                  <span className="ml-2 text-xs font-normal text-green-600">(auto-filled with today)</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="date" value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors" />
                </div>
              </div>

              {/* Certificate File Upload — mandatory for new */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Certificate File (PDF / Image) {!editing && <span className="text-red-500">*</span>}
                  {editing && <span className="ml-2 text-xs font-normal text-gray-400">(leave empty to keep existing)</span>}
                </label>
                <label className="flex items-center gap-3 w-full px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
                  <div className="w-9 h-9 bg-blue-100 group-hover:bg-blue-200 rounded-lg flex items-center justify-center shrink-0 transition-colors">
                    <Upload className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {certFile ? certFile.name : editing ? 'Upload new file (optional)' : 'Choose certificate file *'}
                    </p>
                    <p className="text-xs text-gray-400">PDF or image, max 5MB</p>
                  </div>
                  <input type="file" accept=".pdf,image/*" className="hidden" onChange={(e) => setCertFile(e.target.files[0])} />
                </label>
                {certFile && (
                  <p className="mt-1.5 text-xs text-green-600 font-medium flex items-center gap-1">
                    ✓ {certFile.name} selected
                  </p>
                )}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                ⚡ Student will be notified and can view/download the certificate from their dashboard only after you upload the file.
              </div>

              <button type="submit" disabled={saving}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-60">
                {saving ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {editing ? 'Update Certificate' : 'Issue Certificate'}</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
