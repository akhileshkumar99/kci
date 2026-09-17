import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserCheck, UserX, Plus, Edit2, Trash2, Upload, X, Shield, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

export default function AdminShowcase() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    course: '',
    year: '2026',
    displayOrder: 1,
    status: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/showcase');
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      toast.error('Failed to load showcase students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const totalCount = students.length;
  const activeCount = students.filter(s => s.status).length;
  const inactiveCount = students.filter(s => !s.status).length;

  const handleOpenAdd = () => {
    setEditingId(null);
    setForm({
      name: '',
      course: '',
      year: '2026',
      displayOrder: students.length + 1,
      status: true,
    });
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setEditingId(student._id);
    setForm({
      name: student.name || '',
      course: student.course || '',
      year: student.year || '2026',
      displayOrder: student.displayOrder || 1,
      status: student.status !== undefined ? student.status : true,
    });
    setImageFile(null);
    setImagePreview(student.image || '');
    setModalOpen(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.course.trim() || !form.year.trim()) {
      return toast.error('Please fill in Name, Course, and Year.');
    }
    if (!editingId && !imageFile && !imagePreview) {
      return toast.error('Please upload a student profile photo.');
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('course', form.course);
      formData.append('year', form.year);
      formData.append('displayOrder', form.displayOrder);
      formData.append('status', form.status);

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imagePreview) {
        formData.append('imageUrl', imagePreview);
      }

      if (editingId) {
        const { data } = await api.put(`/showcase/${editingId}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (data.success) {
          toast.success('Showcase student updated successfully!');
        }
      } else {
        const { data } = await api.post('/showcase', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (data.success) {
          toast.success('New showcase student added successfully!');
        }
      }
      setModalOpen(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving showcase student.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const { data } = await api.patch(`/showcase/${id}/status`);
      if (data.success) {
        toast.success(data.message);
        setStudents(prev => prev.map(s => s._id === id ? { ...s, status: data.student.status } : s));
      }
    } catch (err) {
      toast.error('Failed to change status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this showcase student?')) return;
    try {
      const { data } = await api.delete(`/showcase/${id}`);
      if (data.success) {
        toast.success('Showcase student deleted.');
        setStudents(prev => prev.filter(s => s._id !== id));
      }
    } catch (err) {
      toast.error('Failed to delete showcase student.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600" />
            <span>Student Showcase Management</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-0.5">
            Add, edit and manage students for the public showcase section
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Student</span>
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Total Students */}
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Students</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{totalCount}</p>
          </div>
        </div>

        {/* Active Students */}
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Students</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{activeCount}</p>
          </div>
        </div>

        {/* Inactive Students */}
        <div className="p-4 rounded-2xl bg-white dark:bg-gray-900 border border-slate-200/80 dark:border-gray-800 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Inactive Students</p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">{inactiveCount}</p>
          </div>
        </div>

      </div>

      {/* Main Table Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-200/80 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 dark:bg-gray-800/60 text-slate-500 dark:text-slate-400 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200/80 dark:border-gray-800">
              <tr>
                <th className="py-3.5 px-4 text-center w-12">#</th>
                <th className="py-3.5 px-4">Image</th>
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-4">Year</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Order</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-gray-800 font-medium text-slate-800 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-semibold">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span>Loading showcase students...</span>
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400 font-semibold">
                    No showcase students found. Click "+ Add Student" to create your first entry.
                  </td>
                </tr>
              ) : (
                students.map((st, index) => (
                  <tr key={st._id} className="hover:bg-slate-50/60 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="py-3.5 px-4 text-center font-bold text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-4">
                      <img
                        src={st.image}
                        alt={st.name}
                        className="w-10 h-10 rounded-full object-cover border-2 border-slate-200 dark:border-gray-700 bg-slate-100"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80';
                        }}
                      />
                    </td>
                    <td className="py-3.5 px-4 font-extrabold text-slate-900 dark:text-white">{st.name}</td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 font-semibold">{st.course}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-500">{st.year}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(st._id)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-extrabold tracking-wide uppercase transition-all cursor-pointer ${
                          st.status
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}
                      >
                        {st.status ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-slate-600 dark:text-slate-400">
                      {st.displayOrder || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(st)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(st._id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-gray-800 overflow-hidden text-slate-900 dark:text-white"
            >
              {/* Modal Header */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <h3 className="text-base font-extrabold flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>{editingId ? 'Edit Showcase Student' : 'Add Showcase Student'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="text-white/70 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                
                {/* Photo Upload */}
                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1.5">
                    Profile Photo
                  </label>
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" className="w-14 h-14 rounded-full object-cover border-2 border-blue-500 shadow-md shrink-0" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-gray-800 flex items-center justify-center text-slate-400 border-2 border-dashed border-slate-300 dark:border-gray-700 shrink-0">
                        <Upload className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="text-xs text-slate-500 file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-400 mt-1">Recommended: Square JPG/PNG image</p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                    Student Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Rahul Kumar"
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 outline-none focus:border-blue-600 transition-all"
                  />
                </div>

                {/* Course & Year */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                      Course Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.course}
                      onChange={e => setForm(p => ({ ...p, course: e.target.value }))}
                      placeholder="e.g. Web Development"
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 outline-none focus:border-blue-600 transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                      Year / Batch *
                    </label>
                    <input
                      type="text"
                      required
                      value={form.year}
                      onChange={e => setForm(p => ({ ...p, year: e.target.value }))}
                      placeholder="e.g. 2026"
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 outline-none focus:border-blue-600 transition-all"
                    />
                  </div>
                </div>

                {/* Order & Status */}
                <div className="grid grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-1">
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={form.displayOrder}
                      onChange={e => setForm(p => ({ ...p, displayOrder: e.target.value }))}
                      className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 outline-none focus:border-blue-600 transition-all"
                    />
                  </div>

                  <div className="pt-4">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.status}
                        onChange={e => setForm(p => ({ ...p, status: e.target.checked }))}
                        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                      />
                      <span>Active Publicly</span>
                    </label>
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex gap-3 pt-3 border-t border-slate-100 dark:border-gray-800">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 dark:bg-gray-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                  >
                    {saving ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <span>Save Showcase</span>
                    )}
                  </button>
                </div>

              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
