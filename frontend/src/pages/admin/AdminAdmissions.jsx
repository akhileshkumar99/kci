import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trash2, CheckCircle, XCircle, Clock } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/Loader';

const statusColors = { Pending: 'bg-yellow-50 text-yellow-700', Approved: 'bg-green-50 text-green-700', Rejected: 'bg-red-50 text-red-700' };
const statusIcons = { Pending: Clock, Approved: CheckCircle, Rejected: XCircle };

export default function AdminAdmissions() {
  const [admissions, setAdmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admissions').then(({ data }) => setAdmissions(data.admissions)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/admissions/${id}`, { status });
      setAdmissions(a => a.map(x => x._id === id ? { ...x, status } : x));
      toast.success(`Status updated to ${status}`);
    } catch { toast.error('Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this admission?')) return;
    try { await api.delete(`/admissions/${id}`); setAdmissions(a => a.filter(x => x._id !== id)); toast.success('Deleted'); } catch { toast.error('Error'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Admissions ({admissions.length})</h1>
      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr>{['Name', 'Email', 'Phone', 'Course', 'Status', 'Date', 'Actions'].map(h => <th key={h} className="text-left p-4 font-semibold text-gray-600">{h}</th>)}</tr></thead>
            <tbody>
              {admissions.map((a) => {
                const Icon = statusIcons[a.status];
                return (
                  <tr key={a._id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{a.name}</td>
                    <td className="p-4 text-gray-600">{a.email}</td>
                    <td className="p-4 text-gray-600">{a.phone}</td>
                    <td className="p-4 text-gray-600">{a.course?.title || '—'}</td>
                    <td className="p-4">
                      <select value={a.status} onChange={(e) => updateStatus(a._id, e.target.value)} className={`px-2 py-1 rounded-lg text-xs font-medium border-0 cursor-pointer ${statusColors[a.status]}`}>
                        {['Pending', 'Approved', 'Rejected'].map(s => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-gray-500 text-xs">{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="p-4">
                      <button onClick={() => handleDelete(a._id)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
              {admissions.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-500">No admissions yet</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
