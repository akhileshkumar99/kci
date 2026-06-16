import sys
sys.stdout.reconfigure(encoding='utf-8')
path = r'c:\Users\DELL\OneDrive\Desktop\kci\frontend\src\pages\BranchDashboard.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Bell to lucide import
content = content.replace(
    "  Plus, Pencil, Trash2, Check, UserCheck, ClipboardCheck, Sun, Moon",
    "  Plus, Pencil, Trash2, Check, UserCheck, ClipboardCheck, Sun, Moon, Bell, Send, RefreshCw"
)
print("1. Icons:", "OK" if "Bell" in content else "FAIL")

# 2. Add notifications tab
content = content.replace(
    "  { id: 'tests', label: 'Monthly Tests', icon: ClipboardCheck },\n];",
    "  { id: 'tests', label: 'Monthly Tests', icon: ClipboardCheck },\n  { id: 'notifications', label: 'Send Notifications', icon: Bell },\n];"
)
print("2. Tab:", "OK" if "'notifications'" in content else "FAIL")

# 3. Find where the last tab content ends and append notifications section
# Find the closing of the tests tab or the logout/main return area
# We'll inject just before the final closing </div> of the tab content area
# Look for the pattern that ends the tabs content

NOTIF_TAB = '''
        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <NotificationPanel branchId={user?._id} branchName={user?.branchName} />
        )}
'''

# Insert before the last closing div before </div>\n    </div>\n  );\n}
# Find end of test tab or last tab section
target = "\n      </div>\n    </div>\n  );\n}"
replacement = NOTIF_TAB + "\n      </div>\n    </div>\n  );\n}"
content = content.replace(target, replacement, 1)
print("3. Tab content:", "OK" if "NotificationPanel" in content else "FAIL")

# 4. Add NotificationPanel component before the default export
PANEL = '''
const NOTIF_TYPES = ['general','exam','result','course','fee','holiday','urgent','admission'];

function NotificationPanel({ branchId, branchName }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', type: 'general' });

  const load = () => {
    setLoading(true);
    api.get('/notifications/branch/list')
      .then(r => setNotifications(r.data.notifications || []))
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return toast.error('Title and message required');
    setSending(true);
    try {
      await api.post('/notifications/branch', { ...form, targetRole: 'student' });
      toast.success('Notification sent to your students!');
      setForm({ title: '', message: '', type: 'general' });
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Send failed'); }
    setSending(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this notification?')) return;
    try {
      await api.delete(`/notifications/branch/${id}`);
      setNotifications(p => p.filter(n => n._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Delete failed'); }
  };

  const typeColors = {
    general:'bg-gray-100 text-gray-700', exam:'bg-blue-100 text-blue-700',
    result:'bg-green-100 text-green-700', course:'bg-violet-100 text-violet-700',
    fee:'bg-orange-100 text-orange-700', holiday:'bg-teal-100 text-teal-700',
    urgent:'bg-red-100 text-red-700', admission:'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className="space-y-6">
      {/* Send Form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-700 px-5 py-4 flex items-center gap-3">
          <Bell className="w-5 h-5 text-white" />
          <div>
            <h2 className="text-white font-black">Send Notification to Students</h2>
            <p className="text-blue-200 text-xs">Notify all students of {branchName || 'your branch'}</p>
          </div>
        </div>
        <form onSubmit={handleSend} className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wide">Title *</label>
              <input type="text" required placeholder="e.g. Class Schedule Update" value={form.title}
                onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wide">Type</label>
              <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 capitalize">
                {NOTIF_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase()+t.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-600 mb-1.5 block uppercase tracking-wide">Message *</label>
            <textarea required rows={3} placeholder="Write your notification message here..." value={form.message}
              onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 bg-gray-50 resize-none" />
          </div>
          <button type="submit" disabled={sending}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-bold hover:shadow-lg transition-all disabled:opacity-60">
            {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Sending...' : 'Send to All My Students'}
          </button>
        </form>
      </div>

      {/* Sent notifications list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-black text-gray-900">Sent Notifications ({notifications.length})</h3>
          <button onClick={load} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-10 h-10 mx-auto mb-3 text-gray-200" />
            <p className="text-gray-400 text-sm">No notifications sent yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map(n => (
              <div key={n._id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50/50">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">{n.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[n.type] || typeColors.general}`}>
                      {n.type}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed">{n.message}</p>
                  <p className="text-[10px] text-gray-400 mt-1">Read by: {n.readBy?.length || 0} students</p>
                </div>
                <button onClick={() => handleDelete(n._id)}
                  className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

'''

# Insert before export default
content = content.replace("export default function BranchDashboard", PANEL + "export default function BranchDashboard")
print("4. Panel:", "OK" if "NotificationPanel" in content else "FAIL")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("\nSaved.")
