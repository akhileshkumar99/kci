import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trash2, CheckCircle, XCircle, Clock, Shield, Search, Eye, X, CheckSquare, Pencil, Save } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = {
  'Draft':           'bg-gray-100 text-gray-600 border border-gray-200',
  'Pending Approval':'bg-yellow-50 text-yellow-700 border border-yellow-200',
  'Verified':        'bg-blue-50 text-blue-700 border border-blue-200',
  'Approved':        'bg-green-50 text-green-700 border border-green-200',
  'Rejected':        'bg-red-50 text-red-700 border border-red-200',
  'Pending':         'bg-yellow-50 text-yellow-700 border border-yellow-200',
};

const STATUS_ICONS = {
  'Draft':           Clock,
  'Pending Approval':Clock,
  'Verified':        CheckSquare,
  'Approved':        CheckCircle,
  'Rejected':        XCircle,
  'Pending':         Clock,
};

// RBAC: what each role can do
const RBAC = {
  admin:    { canVerify: true,  canApprove: true,  canReject: true,  canDelete: true,  canEdit: true  },
  branch:   { canVerify: true,  canApprove: false, canReject: true,  canDelete: false, canEdit: true  },
  franchise:{ canVerify: false, canApprove: false, canReject: false, canDelete: false, canEdit: false },
  student:  { canVerify: false, canApprove: false, canReject: false, canDelete: false, canEdit: false },
};

export default function AdminAdmissions() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewModal, setViewModal]   = useState(false);
  const [viewItem, setViewItem]     = useState(null);
  const [rejectModal, setRejectModal]   = useState(false);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRBAC, setShowRBAC]     = useState(false);
  const { user } = useAuth();
  const [editModal, setEditModal]   = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [editForm, setEditForm]     = useState({});
  const [editSaving, setEditSaving] = useState(false);

  const perms = RBAC[user?.role] || RBAC.student;

  useEffect(() => {
    api.get('/admissions')
      .then(({ data }) => setAdmissions(data.admissions))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status, reason = '') => {
    try {
      const { data } = await api.put(`/admissions/${id}`, { status, rejectionReason: reason });
      setAdmissions(a => a.map(x => x._id === id ? { ...x, ...data.admission, status } : x));
      toast.success(`Admission ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this admission?')) return;
    try {
      await api.delete(`/admissions/${id}`);
      setAdmissions(a => a.filter(x => x._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Error'); }
  };

  const openReject = (a) => { setRejectTarget(a); setRejectReason(''); setRejectModal(true); };
  const confirmReject = () => { updateStatus(rejectTarget._id, 'Rejected', rejectReason); setRejectModal(false); };

  const openEdit = (a) => {
    setEditItem(a);
    setEditForm({
      name: a.name || '', email: a.email || '', phone: a.phone || '',
      fatherName: a.fatherName || '', address: a.address || '',
      qualification: a.qualification || '', session: a.session || a.batch || '',
      formNo: a.formNo || '', message: a.message || '',
    });
    setEditModal(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    try {
      const { data } = await api.patch(`/admissions/${editItem._id}`, editForm);
      setAdmissions(a => a.map(x => x._id === editItem._id ? { ...x, ...data.admission } : x));
      toast.success('Admission updated');
      setEditModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setEditSaving(false);
  };

  const filtered = admissions.filter(a => {
    const matchSearch = !search || [a.name, a.email, a.phone, a.fatherName, a.course?.title, a.formNo].join(' ').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus || (filterStatus === 'Pending Approval' && a.status === 'Pending');
    return matchSearch && matchStatus;
  });

  const counts = {
    all:               admissions.length,
    'Pending Approval':admissions.filter(a => a.status === 'Pending Approval' || a.status === 'Pending').length,
    'Verified':        admissions.filter(a => a.status === 'Verified').length,
    'Approved':        admissions.filter(a => a.status === 'Approved').length,
    'Rejected':        admissions.filter(a => a.status === 'Rejected').length,
  };

  const inp = 'w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Admissions</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Workflow: Submit → Pending → <span className="text-blue-600 font-semibold">Branch Verify</span> → <span className="text-green-600 font-semibold">Admin Approve</span> → Confirmed
          </p>
        </div>
        <button onClick={() => setShowRBAC(v => !v)} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm">
          <Shield className="w-3.5 h-3.5 text-blue-500" /> {showRBAC ? 'Hide' : 'View'} Permissions
        </button>
      </div>

      {/* RBAC Permission Table */}
      {showRBAC && (
        <div className="bg-white rounded-2xl border border-blue-100 shadow-sm p-4 mb-5">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-500" /> Role-Based Access Control (RBAC)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs min-w-[480px]">
              <thead>
                <tr className="bg-gray-50">
                  {['Module', 'Counsellor / Public', 'Branch Manager', 'Admin'].map(h => (
                    <th key={h} className="text-left px-3 py-2.5 font-semibold text-gray-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Create Admission',       '✓', '✓', '✓'],
                  ['Edit Admission',         '✗', '✓', '✓'],
                  ['Verify Admission',       '✗', '✓', '✓'],
                  ['Final Approve',          '✗', '✗', '✓'],
                  ['Reject Admission',       '✗', '✓', '✓'],
                  ['Delete Admission',       '✗', '✗', '✓'],
                  ['Add Student',            '✗', '✓', '✓'],
                  ['Edit Student',           '✓', '✓', '✓'],
                  ['Delete Student',         '✗', '✗', '✓'],
                  ['Upload Result',          '✗', '✓', '✓'],
                  ['Generate Certificate',   '✗', '✗', '✓'],
                ].map(([mod, ...permsRow]) => (
                  <tr key={mod} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-3 py-2 font-medium text-gray-700">{mod}</td>
                    {permsRow.map((p, i) => (
                      <td key={i} className={`px-3 py-2 font-bold text-sm ${p === '✓' ? 'text-green-600' : 'text-red-400'}`}>{p}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Workflow Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-100 rounded-2xl p-4 mb-5">
        <p className="text-xs font-bold text-gray-600 mb-2 uppercase tracking-wide">Admission Workflow</p>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
          <span className="px-3 py-1.5 bg-white rounded-lg border border-gray-200 text-gray-600">📝 Student Submits</span>
          <span className="text-gray-400">→</span>
          <span className="px-3 py-1.5 bg-yellow-50 rounded-lg border border-yellow-200 text-yellow-700">⏳ Pending Approval</span>
          <span className="text-gray-400">→</span>
          <span className="px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200 text-blue-700 flex items-center gap-1"><CheckSquare className="w-3 h-3" /> Branch Verifies</span>
          <span className="text-gray-400">→</span>
          <span className="px-3 py-1.5 bg-indigo-50 rounded-lg border border-indigo-200 text-indigo-700">🔍 Admin Reviews</span>
          <span className="text-gray-400">→</span>
          <span className="px-3 py-1.5 bg-green-50 rounded-lg border border-green-200 text-green-700 flex items-center gap-1"><Shield className="w-3 h-3" /> Admin Approves</span>
          <span className="text-gray-400">→</span>
          <span className="px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200 text-emerald-700">✅ Student Account Created</span>
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <div className="bg-white rounded-xl p-2.5 border border-gray-100">
            <p className="font-bold text-gray-700 mb-1">Counsellor / Public</p>
            <p className="text-gray-500">✓ Can create admission</p>
            <p className="text-red-400">✗ Cannot approve</p>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-gray-100">
            <p className="font-bold text-gray-700 mb-1">Branch Manager</p>
            <p className="text-gray-500">✓ Can edit & verify</p>
            <p className="text-gray-500">✓ Can reject</p>
            <p className="text-red-400">✗ Cannot final approve</p>
          </div>
          <div className="bg-white rounded-xl p-2.5 border border-gray-100">
            <p className="font-bold text-gray-700 mb-1">Admin</p>
            <p className="text-gray-500">✓ Final Approval</p>
            <p className="text-gray-500">✓ Creates student account</p>
            <p className="text-gray-500">✓ Sends login credentials</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
        {[
          { label: 'Total',    count: counts.all,               color: 'bg-gray-50 border-gray-200',   text: 'text-gray-700'   },
          { label: 'Pending',  count: counts['Pending Approval'],color: 'bg-yellow-50 border-yellow-200',text: 'text-yellow-700'},
          { label: 'Verified', count: counts['Verified'],        color: 'bg-blue-50 border-blue-200',   text: 'text-blue-700'  },
          { label: 'Approved', count: counts['Approved'],        color: 'bg-green-50 border-green-200', text: 'text-green-700' },
          { label: 'Rejected', count: counts['Rejected'],        color: 'bg-red-50 border-red-200',     text: 'text-red-700'   },
        ].map(({ label, count, color, text }) => (
          <div key={label} className={`${color} border rounded-xl p-3 text-center cursor-pointer hover:opacity-80 transition-opacity`}
            onClick={() => setFilterStatus(label === 'Total' ? 'all' : label === 'Pending' ? 'Pending Approval' : label)}>
            <div className={`text-2xl font-bold ${text}`}>{count}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email, phone, form no..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-gray-400" /></button>}
        </div>
        <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
          {['all', 'Pending Approval', 'Verified', 'Approved', 'Rejected'].map(s => (
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
              const isPending = a.status === 'Pending Approval' || a.status === 'Pending';
              const isVerified = a.status === 'Verified';
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
                    {perms.canEdit && (
                      <button onClick={() => openEdit(a)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                    )}
                    {isPending && perms.canVerify && (
                      <button onClick={() => updateStatus(a._id, 'Verified')}
                        className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
                        <CheckSquare className="w-3 h-3" /> Verify
                      </button>
                    )}
                    {(isPending || isVerified) && perms.canApprove && (
                      <button onClick={() => updateStatus(a._id, 'Approved')}
                        className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded-lg text-xs font-bold hover:bg-green-700">
                        <Shield className="w-3 h-3" /> Approve
                      </button>
                    )}
                    {(isPending || isVerified) && perms.canReject && (
                      <button onClick={() => openReject(a)}
                        className="flex items-center gap-1 px-2 py-1 bg-red-500 text-white rounded-lg text-xs font-bold hover:bg-red-600">
                        <XCircle className="w-3 h-3" /> Reject
                      </button>
                    )}
                    {perms.canDelete && (
                      <button onClick={() => handleDelete(a._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg ml-auto"><Trash2 className="w-4 h-4" /></button>
                    )}
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
                  const isPending = a.status === 'Pending Approval' || a.status === 'Pending';
                  const isVerified = a.status === 'Verified';
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
                        {a.verifiedBy && <div className="text-[10px] text-blue-400 mt-0.5">Verified by {a.verifiedBy?.name || 'Branch'}</div>}
                        {a.approvedBy && <div className="text-[10px] text-green-500 mt-0.5">Approved by {a.approvedBy?.name || 'Admin'}</div>}
                      </td>
                      <td className="p-4 text-gray-500 text-xs">{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 flex-wrap">
                          <button onClick={() => { setViewItem(a); setViewModal(true); }} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg" title="View"><Eye className="w-4 h-4" /></button>
                          {perms.canEdit && (
                            <button onClick={() => openEdit(a)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg" title="Edit"><Pencil className="w-4 h-4" /></button>
                          )}
                          {isPending && perms.canVerify && (
                            <button onClick={() => updateStatus(a._id, 'Verified')}
                              className="flex items-center gap-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors" title="Verify">
                              <CheckSquare className="w-3 h-3" /> Verify
                            </button>
                          )}
                          {(isPending || isVerified) && perms.canApprove && (
                            <button onClick={() => updateStatus(a._id, 'Approved')}
                              className="flex items-center gap-1 px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors" title="Final Approve">
                              <Shield className="w-3 h-3" /> Approve
                            </button>
                          )}
                          {(isPending || isVerified) && perms.canReject && (
                            <button onClick={() => openReject(a)}
                              className="flex items-center gap-1 px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-bold transition-colors" title="Reject">
                              <XCircle className="w-3 h-3" /> Reject
                            </button>
                          )}
                          {perms.canDelete && (
                            <button onClick={() => handleDelete(a._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="Delete"><Trash2 className="w-4 h-4" /></button>
                          )}
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
                ['Name',            viewItem.name],
                ['Email',           viewItem.email],
                ['Phone',           viewItem.phone],
                ['Father Name',     viewItem.fatherName || '—'],
                ['Course',          viewItem.course?.title || '—'],
                ['DOB',             viewItem.dob ? new Date(viewItem.dob).toLocaleDateString('en-IN') : '—'],
                ['Gender',          viewItem.gender || '—'],
                ['Qualification',   viewItem.qualification || '—'],
                ['Address',         viewItem.address || '—'],
                ['Form No',         viewItem.formNo || '—'],
                ['Session / Batch', viewItem.session || viewItem.batch || '—'],
                ['Enrollment ID',   viewItem.enrollmentId || '—'],
                ['Status',          viewItem.status],
                ['Submitted',       new Date(viewItem.createdAt).toLocaleDateString('en-IN')],
                ...(viewItem.verifiedBy  ? [['Verified By',  viewItem.verifiedBy?.name  || 'Branch']] : []),
                ...(viewItem.verifiedAt  ? [['Verified At',  new Date(viewItem.verifiedAt).toLocaleDateString('en-IN')]] : []),
                ...(viewItem.approvedBy  ? [['Approved By',  viewItem.approvedBy?.name  || 'Admin']] : []),
                ...(viewItem.approvedAt  ? [['Approved At',  new Date(viewItem.approvedAt).toLocaleDateString('en-IN')]] : []),
                ...(viewItem.rejectionReason ? [['Rejection Reason', viewItem.rejectionReason]] : []),
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between items-start py-2 border-b border-gray-50 last:border-0">
                  <span className="text-xs font-semibold text-gray-500 shrink-0 w-36">{label}</span>
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

      {/* Edit Admission Modal */}
      {editModal && editItem && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 flex items-center justify-between">
              <h2 className="text-white font-bold">Edit Admission</h2>
              <button onClick={() => setEditModal(false)}><X className="w-5 h-5 text-white/80" /></button>
            </div>
            <form onSubmit={handleEditSave} className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
              {[['name','Name *','text',true],['email','Email *','email',true],['phone','Phone','tel',false],['fatherName','Father Name','text',false],['qualification','Qualification','text',false],['session','Session / Batch','text',false],['formNo','Form No','text',false]].map(([k,label,type,req]) => (
                <div key={k}>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">{label}</label>
                  <input type={type} required={req} value={editForm[k] || ''} onChange={e => setEditForm(f => ({...f,[k]:e.target.value}))}
                    className={inp} />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold text-gray-600 mb-1 block">Address</label>
                <textarea value={editForm.address || ''} onChange={e => setEditForm(f => ({...f,address:e.target.value}))} rows={2} className={inp + ' resize-none'} />
              </div>
              <div className="flex gap-2 pt-2">
                <button type="button" onClick={() => setEditModal(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={editSaving} className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                  {editSaving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
