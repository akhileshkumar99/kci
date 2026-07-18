import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2, CheckCircle, Clock, Phone, MapPin, Trash2, Check,
  Plus, Pencil, Eye, X, Mail, User, Lock, Search, FileText, AlertTriangle, CalendarClock, Camera
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

const EMPTY = { name: '', email: '', password: '', phone: '', branchName: '', branchCity: '', branchAddress: '', notes: '', isApproved: true, renewalDate: '' };

// Returns { label, color, days } for renewal countdown
function getRenewal(renewalDate) {
  if (!renewalDate) return null;
  const today = new Date(); today.setHours(0,0,0,0);
  const due = new Date(renewalDate); due.setHours(0,0,0,0);
  const days = Math.round((due - today) / (1000 * 60 * 60 * 24));
  if (days < 0)  return { days, label: `Overdue ${Math.abs(days)}d`, color: 'bg-red-100 text-red-700 border-red-200' };
  if (days === 0) return { days, label: 'Due Today', color: 'bg-red-100 text-red-700 border-red-200' };
  if (days <= 7)  return { days, label: `Due in ${days}d`, color: 'bg-orange-100 text-orange-700 border-orange-200' };
  if (days <= 30) return { days, label: `Due in ${days}d`, color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
  return { days, label: `Renews in ${days}d`, color: 'bg-green-100 text-green-700 border-green-200' };
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
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

function BranchForm({ initial, onSave, onClose, loading }) {
  const [form, setForm] = useState(initial);
  const set = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const fields = [
    { name: 'name', label: 'Manager / Owner Name *', icon: User, placeholder: 'Full name' },
    { name: 'email', label: 'Email Address *', icon: Mail, placeholder: 'email@example.com', type: 'email' },
    { name: 'phone', label: 'Phone Number', icon: Phone, placeholder: '10-digit mobile' },
    { name: 'branchName', label: 'Branch / Center Name *', icon: Building2, placeholder: 'e.g. KCI Varanasi Center' },
    { name: 'branchCity', label: 'City *', icon: MapPin, placeholder: 'City name' },
    { name: 'password', label: initial._id ? 'New Password (blank = no change)' : 'Password', icon: Lock, placeholder: initial._id ? 'Enter to change password' : 'Default: kci123456', type: 'password' },
  ];

  return (
    <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="space-y-4">
      {fields.map(({ name, label, icon: Icon, placeholder, type = 'text' }) => (
        <div key={name} className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">{label}</label>
          <div className="relative">
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input name={name} type={type} value={form[name] || ''} onChange={set} placeholder={placeholder}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all" />
          </div>
        </div>
      ))}
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">Branch Address</label>
        <textarea name="branchAddress" value={form.branchAddress || ''} onChange={set} rows={2} placeholder="Full address"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all resize-none" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">Notes (optional)</label>
        <textarea name="notes" value={form.notes || ''} onChange={set} rows={2} placeholder="Internal notes"
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all resize-none" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-semibold text-gray-600">Franchise Renewal Date</label>
        <input name="renewalDate" type="date" value={form.renewalDate ? new Date(form.renewalDate).toISOString().split('T')[0] : ''} onChange={set}
          className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all" />
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="isApproved" checked={!!form.isApproved} onChange={e => setForm(p => ({ ...p, isApproved: e.target.checked }))}
          className="w-4 h-4 accent-blue-600" />
        <label htmlFor="isApproved" className="text-sm text-gray-700 font-medium">Approved (email will be sent)</label>
      </div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Cancel</button>
        <button type="submit" disabled={loading}
          className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
          {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          {initial._id ? 'Save Changes' : 'Add Branch'}
        </button>
      </div>
    </form>
  );
}

function ViewModal({ branch, onClose, onEdit, onApprove, approving, approvedPassword, onPhotoUpload }) {
  const [copied, setCopied] = useState(false);
  const [uploading, setUploading] = useState(false);
  const photoRef = useRef();
  const copyText = text => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const renewal = getRenewal(branch.renewalDate);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const { data } = await api.put(`/branch/${branch._id}/upload-photo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onPhotoUpload(data.branch);
      toast.success('Photo uploaded!');
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  const photoUrl = branch.photo
    ? (branch.photo.startsWith('http') ? branch.photo : `${import.meta.env.VITE_API_URL || ''}${branch.photo}`)
    : null;

  const rows = [
    ['Branch Name', branch.branchName],
    ['City', branch.branchCity],
    ['Phone', branch.phone || 'N/A'],
    ['Email', branch.email],
    ['Address', branch.branchAddress || 'N/A'],
    ['Branch Code', branch.branchCode],
    ['Status', branch.isApproved ? '✅ Approved' : '⏳ Pending'],
    ['Renewal Date', branch.renewalDate ? new Date(branch.renewalDate).toLocaleDateString('en-IN') : '—'],
    ['Renewal Status', renewal ? renewal.label : '—'],
    ['Notes', branch.notes || '—'],
    ['Joined', new Date(branch.createdAt).toLocaleDateString('en-IN')],
  ];
  return (
    <Modal title="Branch Details" onClose={onClose}>
      <div className="flex items-center gap-4 mb-6 p-4 bg-blue-50 rounded-2xl">
        <div className="relative shrink-0">
          {photoUrl ? (
            <img src={photoUrl} alt={branch.name} className="w-14 h-14 rounded-full object-cover border-2 border-blue-200" />
          ) : (
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center border-2 border-blue-200">
              <span className="text-xl font-black text-blue-600">{(branch.name || 'B')[0].toUpperCase()}</span>
            </div>
          )}
          <button onClick={() => photoRef.current.click()} disabled={uploading}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-md transition-colors disabled:opacity-60">
            {uploading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera className="w-3 h-3 text-white" />}
          </button>
          <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
        </div>
        <div>
          <h3 className="font-black text-gray-900 text-lg">{branch.name}</h3>
          <p className="text-sm text-gray-500">{branch.branchName}</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${branch.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {branch.isApproved ? 'Approved' : 'Pending'}
          </span>
        </div>
      </div>

      {/* Login Credentials Box - shown after approve */}
      {approvedPassword && (
        <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-2xl">
          <p className="text-xs font-black text-green-700 mb-3 flex items-center gap-1.5">🔑 Login Credentials (sent via email)</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-green-100">
              <div>
                <p className="text-xs text-gray-400 font-semibold">Email</p>
                <p className="text-sm font-bold text-gray-800">{branch.email}</p>
              </div>
              <button onClick={() => copyText(branch.email)} className="text-xs text-blue-600 hover:text-blue-700 font-bold px-2 py-1 bg-blue-50 rounded-lg">Copy</button>
            </div>
            <div className="flex items-center justify-between bg-white rounded-xl px-3 py-2 border border-green-100">
              <div>
                <p className="text-xs text-gray-400 font-semibold">Password</p>
                <p className="text-sm font-bold text-gray-800 font-mono">{approvedPassword}</p>
              </div>
              <button onClick={() => copyText(approvedPassword)} className="text-xs text-blue-600 hover:text-blue-700 font-bold px-2 py-1 bg-blue-50 rounded-lg">
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2.5 mb-5">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between items-start gap-4 py-2 border-b border-gray-50 last:border-0">
            <span className="text-xs font-semibold text-gray-400 shrink-0 w-24">{label}</span>
            <span className="text-sm text-gray-800 text-right font-medium">{value}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        {!branch.isApproved && (
          <button onClick={() => onApprove(branch._id)} disabled={approving}
            className="flex-1 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {approving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
            Approve & Send Email
          </button>
        )}
        <button onClick={onEdit} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2">
          <Pencil className="w-4 h-4" /> Edit
        </button>
      </div>
    </Modal>
  );
}

export default function AdminBranches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approvedPassword, setApprovedPassword] = useState('');
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/branch').then(r => setBranches(r.data.branches || [])).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async id => {
    setApproving(true);
    try {
      const r = await api.put(`/branch/${id}/approve`);
      const pwd = r.data.password || '';
      setBranches(p => p.map(b => b._id === id ? { ...b, isApproved: true } : b));
      if (selected?._id === id) setSelected(p => ({ ...p, isApproved: true }));
      setApprovedPassword(pwd);
      toast.success('Branch approved! Credentials sent via email.');
    } catch { toast.error('Approval failed'); }
    setApproving(false);
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/branch/${id}`);
      setBranches(p => p.filter(b => b._id !== id));
      toast.success('Branch deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleAdd = async form => {
    if (!form.name || !form.email || !form.branchName || !form.branchCity)
      return toast.error('Fill all required fields');
    setSaving(true);
    try {
      const r = await api.post('/branch', form);
      setBranches(p => [r.data.branch, ...p]);
      setModal(null);
      toast.success('Branch added! Email sent if approved.');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleEdit = async form => {
    setSaving(true);
    try {
      const r = await api.put(`/branch/${selected._id}`, form);
      setBranches(p => p.map(b => b._id === selected._id ? r.data.branch : b));
      setModal(null);
      toast.success('Branch updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const openEdit = b => { setSelected(b); setModal('edit'); };
  const openView = b => { setSelected(b); setModal('view'); };

  const filtered = branches.filter(b => {
    let matchFilter = true;
    if (filter === 'approved') matchFilter = b.isApproved;
    else if (filter === 'pending') matchFilter = !b.isApproved;
    else if (filter === 'overdue') {
      if (!b.renewalDate) return false;
      const d = new Date(b.renewalDate); d.setHours(0,0,0,0);
      matchFilter = d <= today;
    } else if (filter === 'due-soon') {
      if (!b.renewalDate) return false;
      const d = new Date(b.renewalDate); d.setHours(0,0,0,0);
      const diff = Math.round((d - today) / 86400000);
      matchFilter = diff > 0 && diff <= 30;
    }
    const q = search.toLowerCase();
    const matchSearch = !q || b.branchName?.toLowerCase().includes(q) || b.branchCity?.toLowerCase().includes(q) || b.name?.toLowerCase().includes(q) || b.branchCode?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  const today = new Date(); today.setHours(0,0,0,0);
  const stats = {
    total: branches.length,
    approved: branches.filter(b => b.isApproved).length,
    pending: branches.filter(b => !b.isApproved).length,
    overdue: branches.filter(b => {
      if (!b.renewalDate) return false;
      const d = new Date(b.renewalDate); d.setHours(0,0,0,0);
      return d <= today;
    }).length,
    dueSoon: branches.filter(b => {
      if (!b.renewalDate) return false;
      const d = new Date(b.renewalDate); d.setHours(0,0,0,0);
      const diff = Math.round((d - today) / 86400000);
      return diff > 0 && diff <= 30;
    }).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Branch Management</h1>
          <p className="text-xs sm:text-sm text-gray-500">{stats.total} total · {stats.approved} approved · {stats.pending} pending</p>
        </div>
        <button onClick={() => setModal('add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-colors shadow-md">
          <Plus className="w-4 h-4" /> Add Branch
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: stats.total, color: 'bg-blue-500', icon: Building2, f: 'all' },
          { label: 'Approved', value: stats.approved, color: 'bg-green-500', icon: CheckCircle, f: 'approved' },
          { label: 'Pending', value: stats.pending, color: 'bg-yellow-500', icon: Clock, f: 'pending' },
          { label: 'Overdue', value: stats.overdue, color: 'bg-red-500', icon: AlertTriangle, f: 'overdue' },
          { label: 'Due in 30d', value: stats.dueSoon, color: 'bg-orange-500', icon: CalendarClock, f: 'due-soon' },
        ].map(s => (
          <button key={s.label} onClick={() => setFilter(s.f)}
            className={`bg-white rounded-2xl p-4 shadow-sm border transition-all flex items-center gap-3 text-left ${
              filter === s.f ? 'border-blue-400 ring-2 ring-blue-200' : 'border-gray-100 hover:border-gray-200'
            }`}>
            <div className={`w-10 h-10 ${s.color} rounded-xl flex items-center justify-center shrink-0`}>
              <s.icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-black text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, city, code..."
          className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-white" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-200" />
          <p>No branches found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filtered.map((b, i) => (
            <motion.div key={b._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold ${b.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {b.isApproved ? <><CheckCircle className="w-3 h-3" /> Approved</> : <><Clock className="w-3 h-3" /> Pending</>}
                </span>
              </div>
              <h3 className="font-black text-gray-900 text-sm mb-0.5 line-clamp-1">{b.branchName}</h3>
              <p className="text-xs text-gray-500 mb-2">{b.name}</p>
              <div className="space-y-1 text-xs text-gray-500 mb-3">
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 shrink-0" /> {b.branchCity}</div>
                <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 shrink-0" /> {b.phone || 'N/A'}</div>
                <div className="truncate text-gray-400">{b.email}</div>
                {b.branchCode && <div className="font-mono text-blue-600 font-bold">{b.branchCode}</div>}
              </div>
              {/* Renewal countdown */}
              {(() => {
                const r = getRenewal(b.renewalDate);
                if (!r) return <div className="text-xs text-gray-300 mb-3 flex items-center gap-1"><CalendarClock className="w-3 h-3" /> No renewal date set</div>;
                return (
                  <div className={`mb-3 flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg border w-fit ${r.color}`}>
                    {r.days <= 0 ? <AlertTriangle className="w-3 h-3" /> : <CalendarClock className="w-3 h-3" />}
                    {r.label}
                    <span className="font-normal opacity-70">· {new Date(b.renewalDate).toLocaleDateString('en-IN')}</span>
                  </div>
                );
              })()}

              <div className="flex gap-2">
                <button onClick={() => openView(b)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-xs font-bold transition-colors">
                  <Eye className="w-3.5 h-3.5" /> View
                </button>
                <button onClick={() => openEdit(b)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-600 rounded-xl text-xs font-bold transition-colors">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => handleDelete(b._id, b.branchName)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-colors">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>

              {!b.isApproved && (
                <button onClick={() => handleApprove(b._id)} disabled={approving}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2 bg-green-600 text-white rounded-xl text-xs font-bold hover:bg-green-700 transition-colors disabled:opacity-60">
                  <Check className="w-3.5 h-3.5" /> Approve & Send Email
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AnimatePresence>
        {modal === 'add' && (
          <Modal title="Add New Branch" onClose={() => setModal(null)}>
            <BranchForm initial={EMPTY} onSave={handleAdd} onClose={() => setModal(null)} loading={saving} />
          </Modal>
        )}
        {modal === 'edit' && selected && (
          <Modal title="Edit Branch" onClose={() => setModal(null)}>
            <BranchForm initial={selected} onSave={handleEdit} onClose={() => setModal(null)} loading={saving} />
          </Modal>
        )}
        {modal === 'view' && selected && (
          <ViewModal branch={selected} onClose={() => { setModal(null); setApprovedPassword(''); }} onEdit={() => setModal('edit')}
            onApprove={handleApprove} approving={approving} approvedPassword={approvedPassword}
            onPhotoUpload={updated => { setBranches(p => p.map(b => b._id === updated._id ? updated : b)); setSelected(updated); }} />
        )}
      </AnimatePresence>
    </div>
  );
}
