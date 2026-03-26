import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Trash2, Eye, Mail } from 'lucide-react';
import api from '../../utils/api';
import Loader from '../../components/Loader';

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchContacts(); }, []);
  const fetchContacts = async () => {
    try { const { data } = await api.get('/contact'); setContacts(data.contacts); } catch {}
    setLoading(false);
  };

  const markRead = async (id) => {
    try {
      await api.put(`/contact/${id}/read`);
      setContacts(c => c.map(x => x._id === id ? { ...x, isRead: true } : x));
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try { await api.delete(`/contact/${id}`); toast.success('Deleted'); fetchContacts(); setSelected(null); } catch { toast.error('Error'); }
  };

  const openMessage = (c) => { setSelected(c); if (!c.isRead) markRead(c._id); };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages ({contacts.filter(c => !c.isRead).length} unread)</h1>
      {loading ? <Loader /> : (
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-2">
            {contacts.map((c) => (
              <div key={c._id} onClick={() => openMessage(c)} className={`p-4 rounded-xl cursor-pointer border transition-all ${selected?._id === c._id ? 'border-blue-500 bg-blue-50' : 'border-gray-100 bg-white hover:bg-gray-50'} ${!c.isRead ? 'border-l-4 border-l-blue-500' : ''}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-gray-900 text-sm">{c.name}</span>
                  {!c.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full" />}
                </div>
                <p className="text-gray-600 text-xs truncate">{c.subject}</p>
                <p className="text-gray-400 text-xs mt-1">{new Date(c.createdAt).toLocaleDateString('en-IN')}</p>
              </div>
            ))}
            {contacts.length === 0 && <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-100"><Mail className="w-8 h-8 mx-auto mb-2 text-gray-300" /><p>No messages yet</p></div>}
          </div>

          <div className="lg:col-span-2">
            {selected ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-gray-900">{selected.subject}</h2>
                    <p className="text-gray-500 text-sm">From: {selected.name} ({selected.email})</p>
                    {selected.phone && <p className="text-gray-500 text-sm">Phone: {selected.phone}</p>}
                    <p className="text-gray-400 text-xs mt-1">{new Date(selected.createdAt).toLocaleString('en-IN')}</p>
                  </div>
                  <button onClick={() => handleDelete(selected._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-gray-700 leading-relaxed">{selected.message}</p>
                </div>
                <a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors">
                  <Mail className="w-4 h-4" /> Reply via Email
                </a>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 h-64 flex items-center justify-center text-gray-400">
                <div className="text-center"><Eye className="w-8 h-8 mx-auto mb-2" /><p>Select a message to view</p></div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
