import { useEffect, useState, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Trash2, Search, Plus, X, User, Mail, Phone, BookOpen, Hash, Calendar, Pencil, Eye, ImagePlus, Download, Upload, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from '../../utils/api';
import Loader from '../../components/Loader';

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

const emptyForm = { name: '', email: '', phone: '', batch: '', admissionDate: '', courseName: '', fatherName: '', dob: '', address: '', branchId: '', photo: null };

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [nextRoll, setNextRoll] = useState('');
  const [editModal, setEditModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [viewModal, setViewModal] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);

  const [imgPreview, setImgPreview] = useState(null);

  const [migrating, setMigrating] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState('all'); // all | yearly | monthly | weekly
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth()); // 0-11
  const importRef = useRef();

  const [branches, setBranches] = useState([]);

  const handleMigrateFormNo = async () => {
    if (!confirm('Assign Form No to all students who don\'t have one?')) return;
    setMigrating(true);
    try {
      const { data } = await api.post('/admin/migrate-form-no');
      toast.success(`✅ ${data.updated} students updated with Form No!`);
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || 'Migration failed'); }
    setMigrating(false);
  };

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/admin/students');
      setStudents(data.students);
      const next = data.students.length + 1;
      const year = new Date().getFullYear();
      const serial = String(next).padStart(4, '0');
      setNextRoll(`KCI${year}${serial} | KCI/ENR/${year}/${serial}`);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
    api.get('/admin/branch-users').then(r => setBranches(r.data.branches || [])).catch(() => {});
  }, []);

  const openModal = () => { setForm(emptyForm); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return toast.error('Name and email are required');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('email', form.email);
      fd.append('password', 'kci123456');
      fd.append('phone', form.phone);
      fd.append('batch', form.batch);
      fd.append('admissionDate', form.admissionDate);
      fd.append('courseName', form.courseName);
      fd.append('fatherName', form.fatherName || '');
      fd.append('dob', form.dob || '');
      fd.append('address', form.address || '');
      if (form.branchId) fd.append('branchId', form.branchId);
      if (form.photo) fd.append('photo', form.photo);
      await api.post('/admin/students', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success(`Student added — Roll: ${nextRoll}`);
      setModal(false);
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const openEdit = (s) => {
    setEditStudent(s);
    setEditForm({
      name: s.name, email: s.email, phone: s.phone || '',
      batch: s.batch || '', courseName: s.courseName || s.course?.title || '',
      fatherName: s.fatherName || '', dob: s.dob ? new Date(s.dob).toISOString().split('T')[0] : '',
      address: s.address || '', admissionDate: s.admissionDate ? new Date(s.admissionDate).toISOString().split('T')[0] : '',
      isApproved: s.isApproved || false, branchId: s.branchId?._id || s.branchId || '', photo: null
    });
    setEditModal(true);
  };

  const handleApprove = async (s) => {
    try {
      await api.put(`/admin/students/${s._id}`, { isApproved: true });
      setStudents(p => p.map(x => x._id === s._id ? { ...x, isApproved: true } : x));
      toast.success(`${s.name} approved!`);
    } catch { toast.error('Approval failed'); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.email) return toast.error('Name and email required');
    setSaving(true);
    try {
      const fd = new FormData();
      ['name','email','phone','batch','courseName','fatherName','dob','address','admissionDate'].forEach(k => fd.append(k, editForm[k] || ''));
      fd.append('isApproved', editForm.isApproved);
      if (editForm.branchId) fd.append('branchId', editForm.branchId);
      if (editForm.photo) fd.append('photo', editForm.photo);
      await api.put(`/admin/students/${editStudent._id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Student updated');
      setEditModal(false);
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const setE = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    try { await api.delete(`/admin/students/${id}`); setStudents(s => s.filter(x => x._id !== id)); toast.success('Deleted'); } catch { toast.error('Error'); }
  };

  const now = new Date();
  const filtered = students.filter(s => {
    const match = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      (s.rollNumber || '').toLowerCase().includes(search.toLowerCase());
    if (!match) return false;
    const d = new Date(s.createdAt);
    if (filterPeriod === 'yearly') return d.getFullYear() === Number(filterYear);
    if (filterPeriod === 'monthly') return d.getFullYear() === Number(filterYear) && d.getMonth() === Number(filterMonth);
    if (filterPeriod === 'weekly') {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7);
      return d >= weekAgo;
    }
    return true;
  });

  const exportExcel = () => {
    const rows = filtered.map(s => ({
      Name: s.name, Email: s.email, Phone: s.phone || '',
      'Roll No': s.rollNumber || '', 'Enrollment No': s.enrollmentNumber || '',
      'Form No': s.formNo || '', Course: s.courseName || s.course?.title || '',
      Batch: s.batch || '', 'Admission Date': s.admissionDate ? new Date(s.admissionDate).toLocaleDateString('en-IN') : '',
      Joined: new Date(s.createdAt).toLocaleDateString('en-IN'),
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `KCI_Students_${filterPeriod}_${Date.now()}.xlsx`);
    toast.success('Exported to Excel!');
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
            const fd = new FormData();
            fd.append('name', row.Name); fd.append('email', row.Email);
            fd.append('password', 'kci123456'); fd.append('phone', row.Phone || '');
            fd.append('batch', row.Batch || ''); fd.append('courseName', row.Course || '');
            fd.append('admissionDate', row['Admission Date'] || '');
            await api.post('/admin/students', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
            added++;
          } catch {}
        }
        toast.success(`${added} students imported!`);
        fetchStudents();
      } catch { toast.error('Invalid Excel file'); }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mr-2">Students ({filtered.length}/{students.length})</h1>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>

        {/* Period Filter */}
        <div className="flex items-center gap-1.5 bg-gray-100 rounded-xl p-1">
          {['all','weekly','monthly','yearly'].map(p => (
            <button key={p} onClick={() => setFilterPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                filterPeriod === p ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'
              }`}>{p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}</button>
          ))}
        </div>

        {/* Year picker */}
        {(filterPeriod === 'yearly' || filterPeriod === 'monthly') && (
          <select value={filterYear} onChange={e => setFilterYear(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        )}

        {/* Month picker */}
        {filterPeriod === 'monthly' && (
          <select value={filterMonth} onChange={e => setFilterMonth(Number(e.target.value))}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
              <option key={i} value={i}>{m}</option>
            ))}
          </select>
        )}

        <div className="ml-auto flex items-center gap-2">
          {/* Import */}
          <input ref={importRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={importExcel} />
          <button onClick={() => importRef.current.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
            <Upload className="w-4 h-4" /> Import
          </button>

          {/* Export */}
          <button onClick={exportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>

          <button onClick={handleMigrateFormNo} disabled={migrating}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-60">
            {migrating ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Hash className="w-4 h-4" />}
            Assign Form No
          </button>
          <button onClick={openModal} className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['Name', 'Enrollment No.', 'Phone', 'Course', 'Batch', 'Status', 'Actions'].map(h => (
                <th key={h} className="text-left p-4 font-semibold text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
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
                        <div className="font-medium text-gray-900">{s.name}</div>
                        <div className="text-xs text-gray-400">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-mono">{s.enrollmentNumber || '—'}</span></td>
                  <td className="p-4 text-gray-600">{s.phone || '—'}</td>
                  <td className="p-4 text-gray-600 max-w-[160px] truncate">{s.courseName || s.course?.title || '—'}</td>
                  <td className="p-4 text-gray-600">{s.batch || '—'}</td>
                  <td className="p-4"><span className={`px-2 py-1 rounded-lg text-xs font-semibold ${s.isApproved ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>{s.isApproved ? '✓ Approved' : 'Pending'}</span></td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      {!s.isApproved && (
                        <button onClick={() => handleApprove(s)} className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors" title="Approve">Approve</button>
                      )}
                      <button onClick={() => { setViewStudent(s); setViewModal(true); }} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(s)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(s._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-500">No students found</td></tr>}
            </tbody>
          </table>
        </div>
      )}

      {/* VIEW MODAL */}
      {viewModal && viewStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-gray-700 to-gray-900 p-5 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Student Details</h2>
              <button onClick={() => setViewModal(false)}><X className="w-5 h-5 text-white/80 hover:text-white" /></button>
            </div>
            <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-center mb-4">
                {viewStudent.photo ? (
                  <img
                    src={getPhotoUrl(viewStudent.photo)}
                    alt={viewStudent.name}
                    onClick={() => setImgPreview(getPhotoUrl(viewStudent.photo))}
                    className="w-20 h-20 rounded-full object-cover border-4 border-blue-100 shadow cursor-pointer hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-3xl font-bold text-blue-600">{viewStudent.name[0].toUpperCase()}</span>
                  </div>
                )}
              </div>
              {[
                ['Roll Number', viewStudent.rollNumber, 'font-mono text-blue-700 font-black text-base'],
                ['Enrollment No.', viewStudent.enrollmentNumber, 'font-mono text-green-700 font-black text-base'],
                ['Form No.', viewStudent.formNo, 'font-mono text-purple-700 font-black text-base'],
                ['Full Name', viewStudent.name],
                ['Email', viewStudent.email],
                ['Phone', viewStudent.phone || '—'],
                ['Course', viewStudent.courseName || viewStudent.course?.title || '—'],
                ['Batch', viewStudent.batch || '—'],
                ["Father's Name", viewStudent.fatherName || '—'],
                ['Date of Birth', viewStudent.dob ? new Date(viewStudent.dob).toLocaleDateString('en-IN') : '—'],
                ['Address', viewStudent.address || '—'],
                ['Admission Date', viewStudent.admissionDate ? new Date(viewStudent.admissionDate).toLocaleDateString('en-IN') : '—'],
                ['Status', viewStudent.isApproved ? 'Approved ✓' : 'Pending'],
                ['Joined', new Date(viewStudent.createdAt).toLocaleDateString('en-IN')],
                ...(viewStudent.branchId ? [
                  ['Branch Name', viewStudent.branchId.branchName || viewStudent.branchId.name || '—'],
                  ['Branch Code', viewStudent.branchId.branchCode || '—'],
                  ['Branch City', viewStudent.branchId.branchCity || '—'],
                  ['Branch Owner', viewStudent.branchId.name || '—'],
                ] : [
                  ['Branch Name', viewStudent.branchName || '—'],
                  ['Branch Code', viewStudent.branchCode || '—'],
                ]),
              ].map(([label, val, cls = '']) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-semibold text-gray-500">{label}</span>
                  <span className={`text-sm font-medium text-gray-800 ${cls}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editModal && editStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Edit Student</h2>
                <p className="text-blue-100 text-xs mt-0.5 font-mono">{editStudent.rollNumber}</p>
              </div>
              <button onClick={() => setEditModal(false)}><X className="w-5 h-5 text-white/80 hover:text-white" /></button>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><User className="w-3.5 h-3.5" /> Full Name *</label>
                  <input value={editForm.name} onChange={e => setE('name', e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Phone className="w-3.5 h-3.5" /> Phone</label>
                  <input type="tel" value={editForm.phone} onChange={e => setE('phone', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Mail className="w-3.5 h-3.5" /> Email *</label>
                  <input type="email" value={editForm.email} onChange={e => setE('email', e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><User className="w-3.5 h-3.5" /> Father's Name</label>
                  <input value={editForm.fatherName} onChange={e => setE('fatherName', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Calendar className="w-3.5 h-3.5" /> Date of Birth</label>
                  <input type="date" value={editForm.dob} onChange={e => setE('dob', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Calendar className="w-3.5 h-3.5" /> Admission Date</label>
                  <input type="date" value={editForm.admissionDate} onChange={e => setE('admissionDate', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Calendar className="w-3.5 h-3.5" /> Batch</label>
                  <input value={editForm.batch} onChange={e => setE('batch', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><BookOpen className="w-3.5 h-3.5" /> Course</label>
                  <select value={editForm.courseName} onChange={e => setE('courseName', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">-- Select Course --</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">Address</label>
                <input value={editForm.address} onChange={e => setE('address', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">Assign Branch</label>
                <select value={editForm.branchId} onChange={e => setE('branchId', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">-- No Branch --</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.branchName} {b.branchCode ? `(${b.branchCode})` : ''} — {b.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <input type="checkbox" id="isApproved" checked={editForm.isApproved} onChange={e => setE('isApproved', e.target.checked)} className="w-4 h-4 accent-green-600 cursor-pointer" />
                <label htmlFor="isApproved" className="text-sm font-semibold text-gray-700 cursor-pointer">Mark as Approved</label>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><ImagePlus className="w-3.5 h-3.5" /> Update Photo (optional)</label>
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <input type="file" className="hidden" accept="image/*" onChange={e => setE('photo', e.target.files[0])} />
                  {editForm.photo ? <span className="text-sm text-blue-600 font-medium px-4 truncate max-w-full">{editForm.photo.name}</span>
                    : <><ImagePlus className="w-5 h-5 text-gray-400 mb-1" /><span className="text-xs text-gray-400">{editStudent?.photo ? 'Click to change photo' : 'Click to upload photo'}</span></>}
                </label>
              </div>
              <button type="submit" disabled={saving} className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Pencil className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold text-lg">Add New Student</h2>
                <p className="text-blue-100 text-xs mt-0.5">Enrollment No. will be auto-assigned: <span className="font-mono font-bold">{nextRoll}</span></p>
              </div>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-white/80 hover:text-white" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Hash className="w-3.5 h-3.5" /> Enrollment Number (Auto)</label>
                <input value={nextRoll} readOnly className="w-full px-3 py-2.5 border border-blue-200 bg-blue-50 rounded-xl text-sm font-mono text-blue-700 font-semibold cursor-not-allowed" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><User className="w-3.5 h-3.5" /> Full Name *</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Phone className="w-3.5 h-3.5" /> Phone</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Mail className="w-3.5 h-3.5" /> Email *</label>
                  <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><User className="w-3.5 h-3.5" /> Father's Name</label>
                  <input value={form.fatherName} onChange={e => set('fatherName', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Calendar className="w-3.5 h-3.5" /> Date of Birth</label>
                  <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Calendar className="w-3.5 h-3.5" /> Admission Date</label>
                  <input type="date" value={form.admissionDate} onChange={e => set('admissionDate', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Calendar className="w-3.5 h-3.5" /> Batch</label>
                  <input value={form.batch} onChange={e => set('batch', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><BookOpen className="w-3.5 h-3.5" /> Course</label>
                  <select value={form.courseName} onChange={e => set('courseName', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                    <option value="">-- Select Course --</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">Address</label>
                <input value={form.address} onChange={e => set('address', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5">Assign Branch</label>
                <select value={form.branchId} onChange={e => set('branchId', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">-- No Branch --</option>
                  {branches.map(b => (
                    <option key={b._id} value={b._id}>{b.branchName} {b.branchCode ? `(${b.branchCode})` : ''} — {b.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><ImagePlus className="w-3.5 h-3.5" /> Student Photo (optional)</label>
                <label className="flex flex-col items-center justify-center w-full h-20 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <input type="file" className="hidden" accept="image/*" onChange={e => set('photo', e.target.files[0])} />
                  {form.photo ? <span className="text-sm text-blue-600 font-medium px-4 truncate max-w-full">{form.photo.name}</span>
                    : <><ImagePlus className="w-5 h-5 text-gray-400 mb-1" /><span className="text-xs text-gray-400">Click to upload photo</span></>}
                </label>
              </div>
              <button type="submit" disabled={saving}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
                {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Adding...' : 'Add Student'}
              </button>
            </form>
          </div>
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
    </div>
  );
}
