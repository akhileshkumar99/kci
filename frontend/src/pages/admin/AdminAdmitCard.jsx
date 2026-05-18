import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminAdmitCard() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    api.get('/admit-card/setting')
      .then(({ data }) => setEnabled(data.enabled))
      .catch(() => toast.error('Failed to load setting'))
      .finally(() => setLoading(false));
  }, []);

  const toggle = async () => {
    setSaving(true);
    try {
      const newVal = !enabled;
      await api.post('/admit-card/toggle', { enabled: newVal });
      setEnabled(newVal);
      toast.success(`Admit Card download ${newVal ? 'ENABLED' : 'DISABLED'} on Home page`);
    } catch {
      toast.error('Failed to update setting');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>;

  return (
    <div className="max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-black text-gray-900">Admit Card Control</h1>
          <p className="text-sm text-gray-500">Show or hide admit card download section on the home page</p>
        </div>
      </div>

      {/* Status Card */}
      <motion.div layout className={`rounded-2xl border-2 p-6 mb-6 transition-all duration-300 ${
        enabled ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
              enabled ? 'bg-green-100' : 'bg-gray-200'
            }`}>
              {enabled
                ? <Eye className="w-7 h-7 text-green-600" />
                : <EyeOff className="w-7 h-7 text-gray-400" />
              }
            </div>
            <div>
              <p className="font-black text-gray-900 text-lg">
                Admit Card Download
              </p>
              <div className="flex items-center gap-2 mt-1">
                {enabled
                  ? <><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-green-600 font-semibold text-sm">Visible on Home Page</span></>
                  : <><AlertCircle className="w-4 h-4 text-gray-400" /><span className="text-gray-400 font-semibold text-sm">Hidden from Home Page</span></>
                }
              </div>
            </div>
          </div>

          {/* Toggle Switch */}
          <button onClick={toggle} disabled={saving}
            className={`relative w-16 h-8 rounded-full transition-all duration-300 focus:outline-none ${
              enabled ? 'bg-green-500' : 'bg-gray-300'
            } disabled:opacity-60`}>
            <motion.div
              animate={{ x: enabled ? 32 : 4 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
            />
          </button>
        </div>
      </motion.div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 space-y-3">
        <p className="font-bold text-blue-800 text-sm">How it works:</p>
        <ul className="text-sm text-blue-700 space-y-2">
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            When <strong>Enabled</strong> — a "Download Admit Card" section appears on the home page for students.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            Students enter their <strong>Enrollment Number</strong> to fetch their admit card.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            Only students with <strong>Approved</strong> exam form status can download their admit card.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-400 mt-0.5">•</span>
            When <strong>Disabled</strong> — the section is completely hidden from the home page.
          </li>
        </ul>
      </div>

      {/* Quick Action */}
      <div className="mt-6 p-4 bg-white border border-gray-100 rounded-2xl shadow-sm">
        <p className="text-sm text-gray-500 mb-3">Quick action:</p>
        <motion.button onClick={toggle} disabled={saving}
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            enabled
              ? 'bg-red-50 text-red-600 hover:bg-red-100 border-2 border-red-200'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg'
          }`}>
          {saving
            ? <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
            : enabled ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />
          }
          {enabled ? 'Hide Admit Card from Home Page' : 'Show Admit Card on Home Page'}
        </motion.button>
      </div>
    </div>
  );
}
