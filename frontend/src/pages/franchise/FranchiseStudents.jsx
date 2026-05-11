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

export default function FranchiseStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [viewModal, setViewModal] = useState(false);
  const [viewStudent, setViewStudent] = useState(null);
  const [imgPreview, setImgPreview] = useState(null);

  const fetchStudents = async () => {
    try {
      const { data } = await api.get('/franchise/students');
      setStudents(data.students || []);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchStudents(); }, []);

  const openModal = () => { setForm(emptyForm); setModal(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return toast.error('Name required');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      fd.append('batch', form.batch);
      fd.append('courseName', form.courseName);
      if (form.photo) fd.append('photo', form.photo);
await api.post('/franchise/students/register', fd, { headers: { 'Content-Type': 'multipart/form-data' }, withCredentials: true });
      toast.success('Student added successfully');
      setModal(false);
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const openEdit = (s) => {
    setEditStudent(s);
    setEditForm({ name: s.name, phone: s.phone || '', batch: s.batch || '', courseName: s.courseName || '' });
    setEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updates = editForm;
      await api.put(`/franchise/students/${editStudent._id}`, updates);
      toast.success('Student updated');
      setEditModal(false);
      fetchStudents();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const setE = (k, v) => setEditForm(f => ({ ...f, [k]: v }));

  const handleDelete = async (id) => {
    if (!confirm('Delete student?')) return;
    try {
      await api.delete(`/franchise/students/${id}`);
      setStudents(s => s.filter(x => x._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Error'); }
  };

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    (s.rollNumber || '').toLowerCase().includes(search.toLowerCase())
  );

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your Students ({students.length})</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." 
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <button onClick={openModal} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add Student
          </button>
        </div>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-emerald-50 to-emerald-100">
              <tr>
                {['Name', 'Email', 'Roll No.', 'Phone', 'Course', 'Batch', 'Actions'].map(h => (
                  <th key={h} className="text-left p-4 font-semibold text-gray-700">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(s => (
                <tr key={s._id} className="hover:bg-emerald-50/50">
                  <td className="p-4 font-medium text-gray-900">{s.name}</td>
                  <td className="p-4 text-gray-600 max-w-xs truncate">{s.email}</td>
                  <td className="p-4 font-mono text-sm bg-emerald-50 px-3 py-1 rounded-full text-emerald-800 font-semibold">{s.rollNumber}</td>
                  <td className="p-4 text-gray-600">{s.phone || '—'}</td>
                  <td className="p-4 text-gray-700 font-medium max-w-md truncate">{s.courseName}</td>
                  <td className="p-4 text-gray-600 bg-gray-50 px-3 py-1 rounded-full text-xs">{s.batch}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setViewStudent(s); setViewModal(true); }} 
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-all" title="View">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => openEdit(s)} 
                        className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all" title="Edit">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s._id)} 
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="p-12 text-center">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-lg font-medium">No students yet</p>
                    <p className="text-gray-400 text-sm mt-1">Add your first student to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Student Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 flex items-center justify-between">
              <div>
                <h2 className="text-white font-black text-xl">Add New Student</h2>
                <p className="text-emerald-100 text-sm mt-1">Auto-generates roll number & login credentials</p>
              </div>
              <button onClick={() => setModal(false)} className="p-2 hover:bg-white/20 rounded-xl transition-all">
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                    <User className="w-4 h-4" /> Student Name *
                  </label>
                  <input required value={form.name} onChange={e => set('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 text-sm transition-all" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                    <Phone className="w-4 h-4" /> Phone
                  </label>
                  <input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 text-sm transition-all" />
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                    <BookOpen className="w-4 h-4" /> Course *
                  </label>
                  <select required value={form.courseName} onChange={e => set('courseName', e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 text-sm transition-all">
                    <option value="">Select Course...</option>
                    {COURSES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">
                    <Calendar className="w-4 h-4" /> Batch
                  </label>
                  <input value={form.batch} onChange={e => set('batch', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-emerald-200 focus:border-emerald-400 text-sm transition-all" />
                </div>
              </div>
              <button type="submit" disabled={saving}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black py-4 rounded-2xl text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50">
                {saving ? 'Adding Student...' : 'Add Student Now'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* View/Edit Modals - Simplified */}
      {viewModal && viewStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl w-full max-w-sm shadow-2xl">
            <div className="p-6 text-center">
              <img src={viewStudent.photo ? `http://localhost:5000${viewStudent.photo}` : '/default-avatar.jpg'} 
                className="w-24 h-24 rounded-full mx-auto mb-4 shadow-xl object-cover" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{viewStudent.name}</h2>
              <p className="text-emerald-600 font-mono text-lg mb-6">{viewStudent.rollNumber}</p>
              <div className="space-y-3 text-sm">
                <div>Email: <span className="font-semibold">{viewStudent.email}</span></div>
                <div>Phone: {viewStudent.phone || '—'}</div>
                <div>Course: <span className="font-semibold">{viewStudent.courseName}</span></div>
                <div>Batch: {viewStudent.batch || '—'}</div>
              </div>
              <button onClick={() => setViewModal(false)} className="mt-6 w-full bg-emerald-600 text-white py-3 rounded-2xl font-bold hover:bg-emerald-700 transition-colors">Done</button>
            </div>
          </div>
        </div>
      )}

      {editModal && editStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-5">
              <h2 className="text-white font-bold text-xl">Edit Student</h2>
            </div>
            <form onSubmit={handleEdit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input value={editForm.name} onChange={e => setE('name', e.target.value)} placeholder="Name *" className="px-4 py-3 border rounded-2xl text-sm focus:ring-2" required />
                <input value={editForm.phone} onChange={e => setE('phone', e.target.value)} placeholder="Phone" className="px-4 py-3 border rounded-2xl text-sm focus:ring-2" />
              </div>
              <input value={editForm.courseName} onChange={e => setE('courseName', e.target.value)} placeholder="Course" className="w-full px-4 py-3 border rounded-2xl text-sm focus:ring-2" />
              <input value={editForm.batch} onChange={e => setE('batch', e.target.value)} placeholder="Batch" className="w-full px-4 py-3 border rounded-2xl text-sm focus:ring-2" />
              <button type="submit" disabled={saving} className="w-full bg-emerald-600 text-white py-3 rounded-2xl font-bold hover:bg-emerald-700">
                {saving ? 'Saving...' : 'Update Student'}
              </button>
              <button type="button" onClick={() => setEditModal(false)} className="w-full text-gray-500 py-3 border rounded-2xl hover:bg-gray-50">Cancel</button>
            </form>
          </div>
        </div>
      )}

      {imgPreview && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={() => setImgPreview(null)}>
          <img src={imgPreview} className="max-w-full max-h-full rounded-2xl shadow-2xl" />
        </div>
      )}
    </div>
  );
}
