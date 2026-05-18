import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Trash2, Eye, Pencil, Search, X } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const statusColor = {
  Pending:  'bg-yellow-100 text-yellow-700',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700',
};

const inputCls = 'w-full px-3 py-2 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 text-sm transition-all';

export default function AdminExamForms() {
  const [forms, setForms]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [viewForm, setViewForm] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editData, setEditData] = useState({});
  const [saving, setSaving]     = useState(false);

  const fetchForms = async () => {
    try {
      const { data } = await api.get('/exam-forms');
      setForms(data.forms || []);
    } catch { toast.error('Failed to load exam forms'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchForms(); }, []);

  const deleteForm = async (id) => {
    if (!confirm('Delete this exam form?')) return;
    try {
      await api.delete(`/exam-forms/${id}`);
      setForms(p => p.filter(f => f._id !== id));
      toast.success('Deleted successfully');
    } catch { toast.error('Delete failed'); }
  };

  const openEdit = (f) => { setEditForm(f); setEditData({ ...f }); };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const { data } = await api.put(`/exam-forms/${editForm._id}`, editData);
      setForms(p => p.map(f => f._id === editForm._id ? data.form : f));
      setEditForm(null);
      toast.success('Updated successfully');
    } catch { toast.error('Update failed'); }
    finally { setSaving(false); }
  };

  const filtered = forms.filter(f =>
    [f.studentName, f.enrollmentNumber, f.course, f.phone, f.email, f.batch]
      .join(' ').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black text-gray-900">Examination Forms</h1>
            <p className="text-sm text-gray-500">{filtered.length} of {forms.length} submission{forms.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 bg-white border-2 border-gray-100 rounded-xl px-3 py-2 w-full sm:w-72 focus-within:border-blue-500 transition-all">
          <Search className="w-4 h-4 text-gray-400 shrink-0" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, enrollment, course..."
            className="bg-transparent text-sm outline-none flex-1 text-gray-700 placeholder:text-gray-400" />
          {search && <button onClick={() => setSearch('')}><X className="w-4 h-4 text-gray-400 hover:text-gray-600" /></button>}
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>{search ? 'No results found.' : 'No exam forms submitted yet.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((f, i) => (
            <motion.div key={f._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-bold text-gray-900">{f.studentName}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor[f.status]}`}>{f.status}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1 text-sm text-gray-600">
                    <span><b className="text-gray-700">Enrollment:</b> {f.enrollmentNumber}</span>
                    <span><b className="text-gray-700">Course:</b> {f.course}</span>
                    <span><b className="text-gray-700">Batch:</b> {f.batch}</span>
                    <span><b className="text-gray-700">Phone:</b> {f.phone}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => setViewForm(f)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button onClick={() => openEdit(f)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-lg text-xs font-semibold transition-colors">
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button onClick={() => deleteForm(f._id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-xs font-semibold transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* View Modal */}
      <AnimatePresence>
        {viewForm && (
          <Modal onClose={() => setViewForm(null)} title="Exam Form Details">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {[
                ['Student Name', viewForm.studentName],
                ["Father's Name", viewForm.fatherName],
                ["Mother's Name", viewForm.motherName],
                ['Date of Birth', viewForm.dob],
                ['Gender', viewForm.gender],
                ['Category', viewForm.category],
                ['Enrollment No.', viewForm.enrollmentNumber],
                ['Course', viewForm.course],
                ['Batch', viewForm.batch],
                ['Session', viewForm.session],
                ['Qualification', viewForm.qualification],
                ['Subjects', viewForm.subjects],
                ['Phone', viewForm.phone],
                ['Email', viewForm.email],
                ['Status', viewForm.status],
                ['Submitted', new Date(viewForm.createdAt).toLocaleDateString()],
              ].map(([label, val]) => val ? (
                <div key={label} className="bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 font-semibold mb-0.5">{label}</p>
                  <p className="text-gray-800 font-semibold">{val}</p>
                </div>
              ) : null)}
              {viewForm.address && (
                <div className="sm:col-span-2 bg-gray-50 rounded-xl px-4 py-3">
                  <p className="text-xs text-gray-400 font-semibold mb-0.5">Address</p>
                  <p className="text-gray-800 font-semibold">{viewForm.address}</p>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editForm && (
          <Modal onClose={() => setEditForm(null)} title="Edit Exam Form">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { key: 'studentName', label: 'Student Name' },
                { key: 'fatherName',  label: "Father's Name" },
                { key: 'motherName',  label: "Mother's Name" },
                { key: 'dob',         label: 'Date of Birth', type: 'date' },
                { key: 'enrollmentNumber', label: 'Enrollment Number' },
                { key: 'course',      label: 'Course' },
                { key: 'batch',       label: 'Batch' },
                { key: 'session',     label: 'Session' },
                { key: 'qualification', label: 'Qualification' },
                { key: 'phone',       label: 'Phone', type: 'tel' },
                { key: 'email',       label: 'Email', type: 'email' },
              ].map(({ key, label, type = 'text' }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">{label}</label>
                  <input type={type} value={editData[key] || ''} onChange={e => setEditData(p => ({ ...p, [key]: e.target.value }))} className={inputCls} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Gender</label>
                <select value={editData.gender || ''} onChange={e => setEditData(p => ({ ...p, gender: e.target.value }))} className={inputCls}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                <select value={editData.status || 'Pending'} onChange={e => setEditData(p => ({ ...p, status: e.target.value }))} className={inputCls}>
                  <option>Pending</option><option>Approved</option><option>Rejected</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Address</label>
                <textarea value={editData.address || ''} onChange={e => setEditData(p => ({ ...p, address: e.target.value }))} rows={2} className={inputCls + ' resize-none'} />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setEditForm(null)} className="px-5 py-2 rounded-xl border-2 border-gray-200 text-gray-600 text-sm font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={saveEdit} disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all disabled:opacity-60">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ onClose, title, children }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-black text-gray-900 text-lg">{title}</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}
