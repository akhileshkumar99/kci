import sys, re
sys.stdout.reconfigure(encoding='utf-8')
path = r'c:\Users\DELL\OneDrive\Desktop\kci\frontend\src\pages\StudentDashboard.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Bell to lucide import
content = content.replace(
    "  Mail, Phone, Users, MapPin, BadgeCheck, Hash, Layers, ShieldCheck, CalendarDays, MapPinned",
    "  Mail, Phone, Users, MapPin, BadgeCheck, Hash, Layers, ShieldCheck, CalendarDays, MapPinned, Bell"
)
print("1. Bell:", "OK" if "Bell" in content else "FAIL")

# 2. Add notifications tab to ALL_TABS
content = content.replace(
    "  { id: 'changepassword', label: 'Change Password', icon: Lock },\n];",
    "  { id: 'changepassword', label: 'Change Password', icon: Lock },\n  { id: 'notifications', label: 'Notifications', icon: Bell },\n];"
)
print("2. Tab:", "OK" if "'notifications'" in content else "FAIL")

# 3. Add unreadCount + notifications state
content = content.replace(
    "  const [admitCardEnabled, setAdmitCardEnabled] = useState(false);",
    "  const [admitCardEnabled, setAdmitCardEnabled] = useState(false);\n  const [notifications, setNotifications] = useState([]);\n  const [unreadCount, setUnreadCount] = useState(0);"
)
print("3. States:", "OK" if "unreadCount" in content else "FAIL")

# 4. Fetch notifications in useEffect
content = content.replace(
    "    api.get('/admit-card/setting').then(r => setAdmitCardEnabled(r.data.enabled || false)).catch(() => {});",
    "    api.get('/admit-card/setting').then(r => setAdmitCardEnabled(r.data.enabled || false)).catch(() => {});\n    api.get('/notifications/my').then(r => { setNotifications(r.data.notifications || []); setUnreadCount(r.data.unreadCount || 0); }).catch(() => {});"
)
print("4. Fetch:", "OK" if "/notifications/my" in content else "FAIL")

# 5. Add unread badge on Notifications tab button
content = content.replace(
    "              <Icon className=\"w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0\" /> {label}\n            </button>",
    "              <Icon className=\"w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0\" /> {label}\n              {id === 'notifications' && unreadCount > 0 && (\n                <span className=\"ml-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-0.5 shrink-0\">{unreadCount > 9 ? '9+' : unreadCount}</span>\n              )}\n            </button>"
)
print("5. Badge:", "OK" if "unreadCount > 9" in content else "FAIL")

# 6. Insert Notifications tab section before Certificates Tab comment
notif_section = '''        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-black text-gray-900">
                  Notifications {unreadCount > 0 && <span className="text-sm font-bold text-red-500 ml-1">({unreadCount} unread)</span>}
                </h2>
              </div>
              {unreadCount > 0 && (
                <button onClick={() => {
                  api.put('/notifications/mark-all-read').catch(() => {});
                  setNotifications(p => p.map(n => ({ ...n, isRead: true })));
                  setUnreadCount(0);
                }} className="text-xs font-bold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-all">
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                <Bell className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                <p className="text-gray-500 font-semibold">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">Notifications from admin and your branch will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n, i) => {
                  const typeConfig = {
                    exam:      { bg: 'bg-blue-100',   text: 'text-blue-700',   border: 'border-blue-200',   label: 'Exam' },
                    result:    { bg: 'bg-green-100',  text: 'text-green-700',  border: 'border-green-200',  label: 'Result' },
                    course:    { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200', label: 'Course' },
                    fee:       { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: 'Fee' },
                    holiday:   { bg: 'bg-teal-100',   text: 'text-teal-700',   border: 'border-teal-200',   label: 'Holiday' },
                    urgent:    { bg: 'bg-red-100',    text: 'text-red-700',    border: 'border-red-200',    label: 'Urgent' },
                    admission: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200', label: 'Admission' },
                    general:   { bg: 'bg-gray-100',   text: 'text-gray-600',   border: 'border-gray-200',   label: 'General' },
                  };
                  const tc = typeConfig[n.type] || typeConfig.general;
                  const isFromBranch = !!n.branchId;
                  const markRead = () => {
                    if (!n.isRead) {
                      api.put(`/notifications/${n._id}/read`).catch(() => {});
                      setNotifications(p => p.map(x => x._id === n._id ? { ...x, isRead: true } : x));
                      setUnreadCount(p => Math.max(0, p - 1));
                    }
                  };
                  return (
                    <motion.div key={n._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      onClick={markRead}
                      className={`bg-white rounded-2xl border shadow-sm cursor-pointer transition-all hover:shadow-md ${
                        !n.isRead ? 'border-l-4 border-l-blue-500 border-gray-100' : 'border-gray-100'
                      }`}>
                      <div className="flex items-start gap-4 p-4">
                        <div className={`w-10 h-10 ${tc.bg} rounded-xl flex items-center justify-center shrink-0`}>
                          <Bell className={`w-5 h-5 ${tc.text}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <div className="flex items-center gap-2 flex-wrap min-w-0">
                              <span className="font-black text-gray-900 text-sm truncate">{n.title}</span>
                              {!n.isRead && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                            </div>
                            <span className="text-[10px] text-gray-400 whitespace-nowrap shrink-0">
                              {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tc.bg} ${tc.text} border ${tc.border}`}>
                              {tc.label}
                            </span>
                            {isFromBranch ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-600 border border-indigo-200">
                                Branch
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                                Admin
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">{n.message}</p>
                          {n.createdBy && (
                            <p className="text-[10px] text-gray-400 mt-1.5">
                              From: {n.createdBy.branchName || n.createdBy.name || 'KCI Admin'}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {/* Certificates Tab */}'''

content = content.replace("        {/* Certificates Tab */}", notif_section, 1)
print("6. Section:", "OK" if "Notifications Tab" in content else "FAIL")

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("\nSaved.")
