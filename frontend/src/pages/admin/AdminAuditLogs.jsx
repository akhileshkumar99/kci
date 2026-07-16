import { useEffect, useState } from 'react';
import { Shield, RefreshCw, Search, X } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/Loader';

const ACTION_COLORS = {
  ADMISSION_APPROVED: 'bg-green-50 text-green-700',
  ADMISSION_REJECTED: 'bg-red-50 text-red-700',
  ADMISSION_VERIFIED: 'bg-blue-50 text-blue-700',
  RESULT_UPLOADED: 'bg-purple-50 text-purple-700',
  RESULT_UPDATED: 'bg-indigo-50 text-indigo-700',
  RESULT_DELETED: 'bg-red-50 text-red-600',
  STUDENT_UPDATED: 'bg-yellow-50 text-yellow-700',
  STUDENT_CREATED: 'bg-emerald-50 text-emerald-700',
  STUDENT_DELETED: 'bg-red-50 text-red-700',
  CERTIFICATE_GENERATED: 'bg-teal-50 text-teal-700',
  LOGIN: 'bg-gray-100 text-gray-600',
};

const ACTION_LABELS = {
  ADMISSION_APPROVED: '✅ Admission Approved',
  ADMISSION_REJECTED: '❌ Admission Rejected',
  ADMISSION_VERIFIED: '🔍 Admission Verified',
  RESULT_UPLOADED: '📊 Result Uploaded',
  RESULT_UPDATED: '✏️ Result Updated',
  RESULT_DELETED: '🗑️ Result Deleted',
  STUDENT_UPDATED: '✏️ Student Updated',
  STUDENT_CREATED: '➕ Student Created',
  STUDENT_DELETED: '🗑️ Student Deleted',
  CERTIFICATE_GENERATED: '🎓 Certificate Generated',
  LOGIN: '🔐 Login',
};

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  const fetchLogs = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const { data } = await api.get('/admin/audit-logs?limit=200');
      setLogs(data.logs || []);
    } catch {}
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const filtered = logs.filter(l => {
    const matchAction = filterAction === 'all' || l.action === filterAction;
    const matchSearch = !search || [
      l.performedByName, l.performedByRole, l.action,
      l.details?.studentName, l.details?.formNo, l.details?.enrollmentId,
    ].some(v => v && v.toLowerCase().includes(search.toLowerCase()));
    return matchAction && matchSearch;
  });

  const actions = [...new Set(logs.map(l => l.action))];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-red-500" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Audit Logs</h1>
            <p className="text-xs text-gray-500">Track all admin actions for accountability</p>
          </div>
        </div>
        <button onClick={() => fetchLogs(true)} className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:bg-gray-50 shadow-sm">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, action..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          {search && <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-gray-400" /></button>}
        </div>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="all">All Actions</option>
          {actions.map(a => <option key={a} value={a}>{ACTION_LABELS[a] || a}</option>)}
        </select>
        <span className="text-xs text-gray-400 ml-auto">{filtered.length} entries</span>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-gray-50">
              <tr>{['Action', 'Performed By', 'Role', 'Details', 'Date & Time'].map(h => (
                <th key={h} className="text-left p-4 font-semibold text-gray-600">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.map(l => (
                <tr key={l._id} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${ACTION_COLORS[l.action] || 'bg-gray-100 text-gray-600'}`}>
                      {ACTION_LABELS[l.action] || l.action}
                    </span>
                  </td>
                  <td className="p-4 font-medium text-gray-900">{l.performedByName || l.performedBy?.name || '—'}</td>
                  <td className="p-4 text-gray-500 capitalize text-xs">{l.performedByRole || '—'}</td>
                  <td className="p-4 text-gray-600 text-xs max-w-[200px]">
                    {l.details?.studentName && <div><b>Student:</b> {l.details.studentName}</div>}
                    {l.details?.formNo && <div><b>Form No:</b> {l.details.formNo}</div>}
                    {l.details?.enrollmentId && <div><b>Enroll ID:</b> {l.details.enrollmentId}</div>}
                    {l.details?.reason && <div><b>Reason:</b> {l.details.reason}</div>}
                  </td>
                  <td className="p-4 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(l.createdAt).toLocaleDateString('en-IN')}<br />
                    <span className="text-gray-400">{new Date(l.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-gray-500">No audit logs found</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
