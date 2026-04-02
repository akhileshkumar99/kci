import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Info, CheckCircle, AlertCircle, BookOpen, Award } from 'lucide-react';
import api from '../utils/api';

const typeConfig = {
  exam:      { icon: AlertCircle, color: 'bg-orange-50 border-orange-200 text-orange-600', badge: 'bg-orange-100 text-orange-700' },
  result:    { icon: Award,       color: 'bg-green-50 border-green-200 text-green-600',   badge: 'bg-green-100 text-green-700' },
  course:    { icon: BookOpen,    color: 'bg-blue-50 border-blue-200 text-blue-600',      badge: 'bg-blue-100 text-blue-700' },
  general:   { icon: Info,        color: 'bg-gray-50 border-gray-200 text-gray-600',      badge: 'bg-gray-100 text-gray-700' },
  admission: { icon: CheckCircle, color: 'bg-violet-50 border-violet-200 text-violet-600', badge: 'bg-violet-100 text-violet-700' },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/notifications').then(r => setNotifications(r.data.notifications || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <section className="relative bg-gradient-to-br from-blue-800 to-indigo-900 py-12 text-white text-center overflow-hidden">
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 40" className="w-full" preserveAspectRatio="none">
            <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#f9fafb" />
          </svg>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-3xl mx-auto px-4">
          <h1 className="text-4xl sm:text-5xl font-black mb-2">Notifications <span className="text-yellow-400">& Updates</span></h1>
          <p className="text-blue-200">Stay updated with latest announcements from KCI</p>
        </motion.div>
      </section>

      <div className="max-w-3xl mx-auto px-4 py-10">
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <Bell className="w-16 h-16 mx-auto mb-4 text-gray-200" />
            <p className="text-lg font-semibold">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((n, i) => {
              const config = typeConfig[n.type] || typeConfig.general;
              const Icon = config.icon;
              return (
                <motion.div key={n._id} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
                  className={`flex items-start gap-4 p-5 rounded-2xl border-2 ${config.color} bg-white`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${config.badge}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-gray-900">{n.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold capitalize shrink-0 ${config.badge}`}>{n.type}</span>
                    </div>
                    <p className="text-gray-600 text-sm mt-1">{n.message}</p>
                    <p className="text-gray-400 text-xs mt-2">{new Date(n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
