import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trash2, Search, Plus, X, User, Mail, Phone, BookOpen, Hash, Calendar, Pencil, Eye, ImagePlus } from 'lucide-react';
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

const emptyForm = { name: '', email: '', phone: '', batch: '', admissionDate: '', courseName: '', photo: null };

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

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/admin/students');
      setStudents(data.students);
      const next = data.students.length + 1;
      setNextRoll(`KCI${new Date().getFullYear()}${String(next).padStart(4, '0')}`);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, []);

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
    setEditForm({ name: s.name, email: s.email, phone: s.phone || '', batch: s.batch || '', courseName: s.courseName || s.course?.title || '', photo: null });
    setEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editForm.name || !editForm.email) return toast.error('Name and email required');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', editForm.name);
      fd.append('email', editForm.email);
      fd.append('phone', editForm.phone);
      fd.append('batch', editForm.batch);
      fd.append('courseName', editForm.courseName);
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

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()) ||
    (s.rollNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Students ({students.length})</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={openModal} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>{['Name', 'Email', 'Roll No.', 'Phone', 'Course', 'Batch', 'Actions'].map(h => (
                <th key={h} className="text-left p-4 font-semibold text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr key={s._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{s.name}</td>
                  <td className="p-4 text-gray-600">{s.email}</td>
                  <td className="p-4"><span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-mono">{s.rollNumber || '—'}</span></td>
                  <td className="p-4 text-gray-600">{s.phone || '—'}</td>
                  <td className="p-4 text-gray-600 max-w-[160px] truncate">{s.courseName || s.course?.title || '—'}</td>
                  <td className="p-4 text-gray-600">{s.batch || '—'}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
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
            <div className="p-6 space-y-3">
              <div className="flex items-center justify-center mb-4">
                {viewStudent.photo ? (
                  <img
                    src={`http://localhost:5000${viewStudent.photo}`}
                    alt={viewStudent.name}
                    onClick={() => setImgPreview(`http://localhost:5000${viewStudent.photo}`)}
                    className="w-20 h-20 rounded-full object-cover border-4 border-blue-100 shadow cursor-pointer hover:opacity-90 transition-opacity"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-3xl font-bold text-blue-600">{viewStudent.name[0].toUpperCase()}</span>
                  </div>
                )}
              </div>
              {[
                ['Roll Number', viewStudent.rollNumber, 'font-mono text-blue-700'],
                ['Full Name', viewStudent.name],
                ['Email', viewStudent.email],
                ['Phone', viewStudent.phone || '—'],
                ['Course', viewStudent.courseName || viewStudent.course?.title || '—'],
                ['Batch', viewStudent.batch || '—'],
                ['Admission Date', viewStudent.admissionDate ? new Date(viewStudent.admissionDate).toLocaleDateString('en-IN') : '—'],
                ['Status', viewStudent.isActive ? 'Active' : 'Inactive'],
                ['Joined', new Date(viewStudent.createdAt).toLocaleDateString('en-IN')],
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
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><User className="w-3.5 h-3.5" /> Full Name <span className="text-red-500">*</span></label>
                  <input value={editForm.name} onChange={e => setE('name', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Phone className="w-3.5 h-3.5" /> Phone</label>
                  <input type="tel" value={editForm.phone} onChange={e => setE('phone', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Mail className="w-3.5 h-3.5" /> Email <span className="text-red-500">*</span></label>
                <input type="email" value={editForm.email} onChange={e => setE('email', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><ImagePlus className="w-3.5 h-3.5" /> Update Photo (optional)</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <input type="file" className="hidden" accept="image/*" onChange={e => setE('photo', e.target.files[0])} />
                  {editForm.photo
                    ? <span className="text-sm text-blue-600 font-medium px-4 truncate max-w-full">{editForm.photo.name}</span>
                    : <><ImagePlus className="w-5 h-5 text-gray-400 mb-1" /><span className="text-xs text-gray-400">{editStudent?.photo ? 'Click to change photo' : 'Click to upload photo'}</span></>}
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                <p className="text-blue-100 text-xs mt-0.5">Roll No. will be auto-assigned: <span className="font-mono font-bold">{nextRoll}</span></p>
              </div>
              <button onClick={() => setModal(false)}><X className="w-5 h-5 text-white/80 hover:text-white" /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Hash className="w-3.5 h-3.5" /> Roll Number (Auto)</label>
                <input value={nextRoll} readOnly className="w-full px-3 py-2.5 border border-blue-200 bg-blue-50 rounded-xl text-sm font-mono text-blue-700 font-semibold cursor-not-allowed" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><User className="w-3.5 h-3.5" /> Full Name <span className="text-red-500">*</span></label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Phone className="w-3.5 h-3.5" /> Phone</label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Mail className="w-3.5 h-3.5" /> Email <span className="text-red-500">*</span></label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><ImagePlus className="w-3.5 h-3.5" /> Student Photo (optional)</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                  <input type="file" className="hidden" accept="image/*" onChange={e => set('photo', e.target.files[0])} />
                  {form.photo
                    ? <span className="text-sm text-blue-600 font-medium px-4 truncate max-w-full">{form.photo.name}</span>
                    : <><ImagePlus className="w-5 h-5 text-gray-400 mb-1" /><span className="text-xs text-gray-400">Click to upload photo</span></>}
                </label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Calendar className="w-3.5 h-3.5" /> Batch</label>
                  <input value={form.batch} onChange={e => set('batch', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><Calendar className="w-3.5 h-3.5" /> Admission Date</label>
                  <input type="date" value={form.admissionDate} onChange={e => set('admissionDate', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-600 mb-1.5"><BookOpen className="w-3.5 h-3.5" /> Course</label>
                <select value={form.courseName} onChange={e => set('courseName', e.target.value)} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                  <option value="">-- Select Course --</option>
                  {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
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
