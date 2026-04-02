import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, CheckCircle, Clock, Phone, MapPin, Trash2, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../utils/api';

export default function AdminFranchise() {
  const [franchises, setFranchises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/franchise').then(r => setFranchises(r.data.franchises || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleApprove = async id => {
    try {
      await api.put(`/franchise/${id}/approve`);
      setFranchises(p => p.map(f => f._id === id ? { ...f, isApproved: true } : f));
      toast.success('Franchise approved!');
    } catch { toast.error('Failed'); }
  };

  const filtered = franchises.filter(f => filter === 'all' ? true : filter === 'approved' ? f.isApproved : !f.isApproved);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-gray-900">Franchise Management</h1><p className="text-sm text-gray-500">{franchises.length} total franchises</p></div>
        <div className="flex gap-2">
          {['all', 'approved', 'pending'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all capitalize ${filter === f ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

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
            <motion.div key={f._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-green-600" />
                </div>
                <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-bold ${f.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {f.isApproved ? <><CheckCircle className="w-3 h-3" /> Approved</> : <><Clock className="w-3 h-3" /> Pending</>}
                </span>
              </div>
              <h3 className="font-black text-gray-900 mb-1">{f.franchiseCenter}</h3>
              <div className="space-y-1.5 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {f.franchiseCity}</div>
                <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> {f.phone || 'N/A'}</div>
                <div className="text-gray-400">{f.email}</div>
                {f.franchiseCode && <div className="font-mono text-green-600 font-bold">{f.franchiseCode}</div>}
              </div>
              {!f.isApproved && (
                <button onClick={() => handleApprove(f._id)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors">
                  <Check className="w-4 h-4" /> Approve Franchise
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
