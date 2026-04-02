import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { User, Mail, Lock, Phone, MapPin, GraduationCap, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', address: '', fatherName: '', dob: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.phone) return toast.error('Fill all required fields');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await api.post('/auth/register', form);
      const user = await login(form.email, form.password);
      toast.success(`Welcome to KCI, ${user.name}! 🎉`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4 pt-20">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-2xl">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black">Student Registration</h1>
                <p className="text-blue-200 text-sm">Create your KCI student account</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                { name: 'name', label: 'Full Name *', icon: User, placeholder: 'Your full name', type: 'text' },
                { name: 'fatherName', label: "Father's Name", icon: User, placeholder: "Father's name", type: 'text' },
                { name: 'email', label: 'Email *', icon: Mail, placeholder: 'your@email.com', type: 'email' },
                { name: 'phone', label: 'Phone *', icon: Phone, placeholder: '10-digit mobile', type: 'tel' },
                { name: 'dob', label: 'Date of Birth', icon: GraduationCap, placeholder: '', type: 'date' },
              ].map(({ name, label, icon: Icon, placeholder, type }) => (
                <div key={name} className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input name={name} type={type} value={form[name]} onChange={handleChange} placeholder={placeholder}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all text-gray-800" />
                  </div>
                </div>
              ))}

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-gray-700">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="password" type={showPass ? 'text' : 'password'} value={form.password} onChange={handleChange} placeholder="Min 6 characters"
                    className="w-full pl-10 pr-10 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all text-gray-800" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-500">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-gray-700">Address</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <textarea name="address" value={form.address} onChange={handleChange} rows={2} placeholder="Your full address"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all resize-none text-gray-800" />
              </div>
            </div>

            <motion.button type="submit" disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-3">
              {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Registering...</>
                : <><GraduationCap className="w-5 h-5" /> Create Account <ArrowRight className="w-5 h-5" /></>}
            </motion.button>

            <p className="text-center text-sm text-gray-500">
              Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login here</Link>
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
