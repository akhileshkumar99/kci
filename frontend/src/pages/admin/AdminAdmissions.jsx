import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trash2, CheckCircle, XCircle, Clock, Shield, Search, Filter, ChevronDown, Eye, X } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = {
  'Draft': 'bg-gray-100 text-gray-600',
  'Pending Approval': 'bg-yellow-50 text-yellow-700 border border-yellow-200',
  'Approved': 'bg-green-50 text-green-700 border border-green-200',
  'Rejected': 'bg-red-50 text-red-700 border border-red-200',
  // legacy
  'Pending': 'bg-yellow-50 text-yellow-700',
};

const STATUS_ICONS = {
  'Draft': Clock,
  'Pending Approval': Clock,
  'Approved': CheckCircle,
  'Rejected': XCircle,
  'Pending': Clock,
};

export default function AdminAdmissions() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewModal, setViewModal] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [rejectModal, setRejectModal] = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const { user } = useAuth();

  const isSuperAdmin = user?.role === 'admin' && (user?.isSuperAdmin || user?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL || true);
  // In frontend we allow admin to do final approval; backend enforces the real check

  useEffect(() => {
    api.get('/admissions').then(({ data }) => setAdmissions(data.admissions)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status, reason = '') => {
    try {
      await api.put(`/admissions/${id}`, { status, rejectionReason: reason });
      setAdmissions(a => a.map(x => x._id === id ? { ...x, status } : x));
      toast.success(`Admission ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this admission?')) return;
    try { await api.delete(`/admissions/${id}`); setAdmissions(a => a.filter(x => x._id !== id)); toast.success('Deleted'); } catch { toast.error('Error'); }
  };

  const openReject = (a) => { setRejectTarget(a); setRejectReason(''); setRejectModal(true); };
  const confirmReject = () => { updateStatus(rejectTarget._id, 'Rejected', rejectReason); setRejectModal(false); };

  const filtered = admissions.filter(a => {
    const matchSearch = !search || [a.name, a.email, a.phone, a.fatherName, a.course?.title].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const counts = {
    all: admissions.length,
    'Pending Approval': admissions.filter(a => a.status === 'Pending Approval' || a.status === 'Pending').length,
    'Approved': admissions.filter(a => a.status === 'Approved').length,
    'Rejected': admissions.filter(a => a.status === 'Rejected').length,
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admissions</h1>
          <p className="text-xs text-gray-500 mt-0.5">Workflow: Submit → Pending Approval → <span className="text-purple-600 font-semibold">Super Admin Final Approval</span></p>
        </div>
      </div>

      {/* Workflow Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 rounded-2xl p-4 mb-5">
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-gray-600">📝 Student Submits</span>
          <span className="text-gray-400">→</span>
          <span className="px-3 py-1.5 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-700">⏳ Pending Approval</span>
          <span className="text-gray-400">→</span>
          <span className="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200 text-blue-700">🔍 Admin Verification</span>
          <span className="text-gray-400">→</span>
          <span className="px-3 py-1.5 bg-purple-50 rounded-lg border border-purple-200 text-purple-700 flex items-center gap-1"><Shield className="w-3 h-3" /> Super Admin Approval</span>
          <span className="text-gray-400">→</span>
          <span className="px-3 py-1.5 bg-green-50 rounded-lg border border-green-200 text-green-700">✅ Confirmed</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total', count: counts.all, color: 'bg-gray-50 border-gray-200', text: 'text-gray-700' },
          { label: 'Pending', count: counts['Pending Approval'], color: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
          { label: 'Approved', count: counts['Approved'], color: 'bg-green-50 border-green-200', text: 'text-green-700' },
          { label: 'Rejected', count: counts['Rejected'], color: 'bg-red-50 border-red-200', text: 'text-red-700' },
        ].map(({ label, count, color, text }) => (
          <div key={label} className={`${color} border rounded-xl p-3 text-center`}>
            <div className={`text-2xl font-bold ${text}`}>{count}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email, phone..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
          {['all', 'Pending Approval', 'Approved', 'Rejected'].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filterStatus === s ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>
              {s === 'all' ? 'All' : s === 'Pending Approval' ? 'Pending' : s}
            </button>
          ))}
        </div>
      </div>

      {loading ? <Loader /> : (
        <>
          {/* Mobile cards */}
          <div className="sm:hidden space-y-3">
            {filtered.length === 0 && <div className="p-8 text-center text-gray-500 bg-white rounded-2xl border border-gray-100">No admissions found</div>}
            {filtered.map((a) => {
              const Icon = STATUS_ICONS[a.status] || Clock;
              return (
                <div key={a._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-gray-900">{a.name}</div>
                      {a.enrollmentId && <div className="text-xs font-mono text-blue-600 font-bold">{a.enrollmentId}</div>}
                      <div className="text-xs text-gray-500">{a.email}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-600'}`}>
                      <Icon className="w-3 h-3" /> {a.status}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                    <span><b>Phone:</b> {a.phone}</span>
                    <span><b>Course:</b> {a.course?.title || '—'}</span>
                    <span><b>Father:</b> {a.fatherName || '—'}</span>
                    <span><b>Date:</b> {new Date(a.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button onClick={() => { setViewItem(a); setViewModal(true); }} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"><Eye className="w-4 h-4" /></button>
                    {(a.status === 'Pending Approval' || a.status === 'Pending') && (
                      <>
                        <button onClick={() => updateStatus(a._id, 'Approved')}
                          className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">
                          <Shield className="w-3 h-3" /> Final Approve
                        </button>
                        <button onClick={() => openReject(a)}
                          className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600">
                          <XCircle className="w-3 h-3" /> Reject
                        </button>
                      </>
                    )}
                    <button onClick={() => handleDelete(a._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg ml-auto"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop table */}
          <div className="hidden sm:block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>{['Name / ID', 'Contact', 'Course', 'Father', 'DOB', 'Status', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left p-4 font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filtered.map((a) => {
                  const Icon = STATUS_ICONS[a.status] || Clock;
                  return (
                    <tr key={a._id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium text-gray-900">{a.name}</div>
                        {a.enrollmentId && <div className="text-xs font-mono text-blue-600 font-bold">{a.enrollmentId}</div>}
                        {a.formNo && <div className="text-xs text-purple-600 font-mono">{a.formNo}</div>}
                      </td>
                      <td className="p-4">
                        <div className="text-gray-600 text-xs">{a.email}</div>
                        <div className="text-gray-500 text-xs">{a.phone}</div>
                      </td>
                      <td className="p-4 text-gray-600 text-xs">{a.course?.title || '—'}</td>
                      <td className="p-4 text-gray-600 text-xs">{a.fatherName || '—'}</td>
                      <td className="p-4 text-gray-500 text-xs">{a.dob ? new Date(a.dob).toLocaleDateString('en-IN') : '—'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 w-fit ${STATUS_COLORS[a.status] || 'bg-gray-100 text-gray-600'}`}>
                          <Icon className="w-3 h-3" /> {a.status}
                        </span>
                        {a.approvedBy && <div className="text-[10px] text-gray-400 mt-0.5">by {a.approvedBy?.name || 'Admin'}</div>}
                      </td>
                      <td className="p-4 text-gray-500 text-xs">{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button onClick={() => { setViewItem(a); setViewModal(true); }} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg" title="View"><Eye className="w-4 h-4" /></button>
                          {(a.status === 'Pending Approval' || a.status === 'Pending') && (
                            <>
                              <button onClick={() => updateStatus(a._id, 'Approved')}
                                className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors" title="Final Approve">
                                <Shield className="w-3 h-3" /> Approve
                              </button>
                              <button onClick={() => openReject(a)}
                                className="flex items-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors" title="Reject">
                                <XCircle className="w-3 h-3" /> Reject
                              </button>
                            </>
                          )}
                          <button onClick={() => handleDelete(a._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && <tr><td colSpan={8} className="p-8 text-center text-gray-500">No admissions found</td></tr>}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* View Modal */}
      {viewModal && viewItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex items-center justify-between">
              <h2 className="text-white font-bold text-lg">Admission Details</h2>
              <button onClick={() => setViewModal(false)}><X className="w-5 h-5 text-white/80 hover:text-white" /></button>
            </div>
            <div className="p-6 space-y-2 max-h-[70vh] overflow-y-auto">
              {[
                ['Name', viewItem.name],
                ['Email', viewItem.email],
                ['Phone', viewItem.phone],
                ['Father Name', viewItem.fatherName || '—'],
                ['Course', viewItem.course?.title || '—'],
                ['DOB', viewItem.dob ? new Date(viewItem.dob).toLocaleDateString('en-IN') : '—'],
                ['Gender', viewItem.gender || '—'],
                ['Qualification', viewItem.qualification || '—'],
                ['Address', viewItem.address || '—'],
                ['Form No', viewItem.formNo || '—'],
                ['Enrollment ID', viewItem.enrollmentId || '—'],
                ['Status', viewItem.status],
                ['Submitted', new Date(viewItem.createdAt).toLocaleDateString('en-IN')],
                ...(viewItem.approvedBy ? [['Approved By', viewItem.approvedBy?.name || 'Admin']] : []),
                ...(viewItem.rejectionReason ? [['Rejection Reason', viewItem.rejectionReason]] : []),
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-semibold text-gray-500 shrink-0 w-32">{label}</span>
                  <span className="text-sm text-gray-800 text-right">{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && rejectTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-rose-600 p-5 flex items-center justify-between">
              <h2 className="text-white font-bold">Reject Admission</h2>
              <button onClick={() => setRejectModal(false)}><X className="w-5 h-5 text-white/80" /></button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">Rejecting admission for <strong>{rejectTarget.name}</strong></p>
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1.5 block">Reason for Rejection (optional)</label>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} rows={3}
                  placeholder="Enter reason..."
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => setRejectModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button onClick={confirmReject} className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-semibold transition-colors">Confirm Reject</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
