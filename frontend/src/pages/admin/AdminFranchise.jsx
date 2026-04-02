import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, CheckCircle, Clock, Phone, MapPin, Trash2, Check,
  Plus, Pencil, Eye, X, Mail, User, Lock, Search
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const EMPTY = { name: '', email: '', password: '', phone: '', franchiseCenter: '', franchiseCity: '', address: '', isApproved: true };

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </div>
  );
}

function FranchiseForm({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(initial);
  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const fields = [
    { name: 'name', label: 'Full Name *', icon: User, placeholder: 'Owner name' },
    { name: 'email', label: 'Email *', icon: Mail, placeholder: 'email@example.com', type: 'email' },
    { name: 'phone', label: 'Phone', icon: Phone, placeholder: '10-digit mobile' },
    { name: 'franchiseCenter', label: 'Center Name *', icon: Building2, placeholder: 'e.g. KCI Varanasi' },
    { name: 'franchiseCity', label: 'City *', icon: MapPin, placeholder: 'City name' },
    { name: 'password', label: initial._id ? 'New Password (leave blank to keep current)' : 'Password', icon: Lock, placeholder: initial._id ? 'Enter new password to change' : 'Default: kci123456', type: 'password' },
  ];

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      {fields.map(({ name, label, icon: Icon, placeholder, type = 'text' }) => (
        <div key={name} className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">{label}</label>
          <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input name={name} type={type} value={form[name] || ''} onChange={set} placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-all" />
          </div>
        </div>
      ))}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">Address</label>
        <textarea name="address" value={form.address || ''} onChange={set} rows={2} placeholder="Full address"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 bg-gray-50 focus:bg-white transition-all resize-none" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="isApproved" checked={!!form.isApproved} onChange={e => setForm(p => ({ ...p, isApproved: e.target.checked }))}
          className="w-4 h-4 accent-green-600" />
        <label htmlFor="isApproved" className="text-sm text-gray-700 font-medium">Approved</label>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {initial._id ? 'Save Changes' : 'Add Franchise'}
        </button>
      </div>
    </form>
  );
}

function ViewModal({ franchise, onClose, onEdit }) {
  const rows = [
    ['Center', franchise.franchiseCenter],
    ['City', franchise.franchiseCity],
    ['Phone', franchise.phone || 'N/A'],
    ['Email', franchise.email],
    ['Address', franchise.address || 'N/A'],
    ['Code', franchise.franchiseCode],
    ['Status', franchise.isApproved ? 'Approved' : 'Pending'],
    ['Joined', new Date(franchise.createdAt).toLocaleDateString('en-IN')],
  ];
  return (
    <Modal title="Franchise Details" onClose={onClose}>
      <div className="flex items-center gap-4 mb-6 p-4 bg-green-50 rounded-2xl">
        <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center shrink-0">
          <Building2 className="w-7 h-7 text-green-600" />
        </div>
        <div>
          <h3 className="font-black text-gray-900 text-lg">{franchise.name}</h3>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${franchise.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {franchise.isApproved ? 'Approved' : 'Pending'}
          </span>
        </div>
      </div>
      <div className="space-y-2.5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between items-start gap-4 py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs font-semibold text-gray-400 shrink-0 w-20">{label}</span>
            <span className="text-sm text-gray-800 text-right font-medium">{value}</span>
          </div>
        ))}
      </div>
      <button onClick={onEdit} className="w-full mt-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
        <Pencil className="w-4 h-4" /> Edit Franchise
      </button>
    </Modal>
  );
}

export default function AdminFranchise() {
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'add' | 'edit' | 'view'
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/franchise').then(r => setFranchises(r.data.franchises || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async id => {
    try {
      await api.put(`/franchise/${id}/approve`);
      setFranchises(p => p.map(f => f._id === id ? { ...f, isApproved: true } : f));
      toast.success('Franchise approved!');
    } catch { toast.error('Failed'); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/franchise/${id}`);
      setFranchises(p => p.filter(f => f._id !== id));
      toast.success('Franchise deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleAdd = async form => {
    if (!form.name || !form.email || !form.franchiseCenter || !form.franchiseCity)
      return toast.error('Fill all required fields');
    setSaving(true);
    try {
      const r = await api.post('/franchise', form);
      setFranchises(p => [r.data.franchise, ...p]);
      setModal(null);
      toast.success('Franchise added!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleEdit = async form => {
    setSaving(true);
    try {
      const r = await api.put(`/franchise/${selected._id}`, form);
      setFranchises(p => p.map(f => f._id === selected._id ? r.data.franchise : f));
      setModal(null);
      toast.success('Franchise updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const openEdit = f => { setSelected(f); setModal('edit'); };
  const openView = f => { setSelected(f); setModal('view'); };

  const filtered = franchises.filter(f => {
    const matchFilter = filter === 'all' ? true : filter === 'approved' ? f.isApproved : !f.isApproved;
    const q = search.toLowerCase();
    const matchSearch = !q || f.franchiseCenter?.toLowerCase().includes(q) || f.franchiseCity?.toLowerCase().includes(q) || f.name?.toLowerCase().includes(q) || f.franchiseCode?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Franchise Management</h1>
          <p className="text-sm text-gray-500">{franchises.length} total franchises</p>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md">
          <Plus className="w-4 h-4" /> Add Franchise
        </button>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex gap-2">
          {['all', 'approved', 'pending'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${filter === f ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, city, code..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-green-500 bg-white" />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p>No franchises found</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((f, i) => (
            <motion.div key={f._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-green-600" />
                </div>
                <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold ${f.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {f.isApproved ? <><CheckCircle className="w-3 h-3" /> Approved</> : <><Clock className="w-3 h-3" /> Pending</>}
                </span>
              </div>
              <h3 className="font-black text-gray-900 text-sm mb-1 line-clamp-1">{f.franchiseCenter}</h3>
              <div className="space-y-1 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0" /> {f.franchiseCity}</div>
                <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 shrink-0" /> {f.phone || 'N/A'}</div>
                <div className="text-gray-400 truncate">{f.email}</div>
                {f.franchiseCode && <div className="font-mono text-green-600 font-bold">{f.franchiseCode}</div>}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button onClick={() => openView(f)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-colors">
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button onClick={() => openEdit(f)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-xs font-bold transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(f._id, f.franchiseCenter)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>

              {!f.isApproved && (
                <button onClick={() => handleApprove(f._id)}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors">
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {modal === 'add' && (
          <Modal title="Add New Franchise" onClose={() => setModal(null)}>
            <FranchiseForm initial={EMPTY} onSave={handleAdd} onClose={() => setModal(null)} loading={saving} />
          </Modal>
        )}
        {modal === 'edit' && selected && (
          <Modal title="Edit Franchise" onClose={() => setModal(null)}>
            <FranchiseForm initial={selected} onSave={handleEdit} onClose={() => setModal(null)} loading={saving} />
          </Modal>
        )}
        {modal === 'view' && selected && (
          <ViewModal franchise={selected} onClose={() => setModal(null)} onEdit={() => { setModal('edit'); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
