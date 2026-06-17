import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, CheckCircle, User, BookOpen, Phone, AlertCircle, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { QRCodeSVG } from 'qrcode.react';

const UPI_ID = 'akhileshkumar5044@ybl';
const FEE_AMOUNT = '1';
const UPI_NAME = 'Keerti Computer Institute';
const upiLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(UPI_NAME)}&am=${FEE_AMOUNT}&cu=INR&tn=${encodeURIComponent('Exam Form Fee')}`;

const COURSES = ['DCA', 'ADCA', 'CCA', 'PGDCA', 'Tally with GST', 'Web Design', 'Web Development', 'Python', 'MS Office', 'Graphic Design', 'AI & Machine Learning', 'Other'];

const inputCls = 'w-full px-4 py-2.5 border-2 border-gray-100 rounded-xl focus:outline-none focus:border-blue-500 bg-gray-50 transition-all text-sm';
const selectCls = inputCls + ' cursor-pointer';
const labelCls = 'block text-sm font-semibold text-gray-700 mb-1.5';

function SectionHeader({ icon: Icon, title, color }) {
  return (
    <div className={`flex items-center gap-2 pb-3 border-b-2 ${color} mb-5`}>
      <Icon className="w-5 h-5 text-blue-600" />
      <h3 className="font-black text-gray-800 text-base">{title}</h3>
    </div>
  );
}

export default function ExaminationForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    studentName: '', fatherName: '', motherName: '', dob: '', gender: '', category: 'General',
    enrollmentNumber: '', course: '', batch: '', session: '', qualification: '', subjects: '',
    phone: '', email: '', address: '',
  });
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [existingForm, setExistingForm] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1 = form, 2 = payment
  const [utr, setUtr] = useState('');
  const [declared, setDeclared] = useState(false);

  useEffect(() => {
    if (!user) { setChecking(false); return; }
    api.get('/exam-forms/my')
      .then(r => { if (r.data.form) { setAlreadySubmitted(true); setExistingForm(r.data.form); } })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, [user]);

  const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleFormNext = e => {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!utr.trim()) { setError('Please enter UTR / Transaction ID.'); return; }
    setLoading(true); setError('');
    try {
      await api.post('/exam-forms', { ...form, paymentUtr: utr });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checking) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (alreadySubmitted && existingForm) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pt-28 pb-16 px-4 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-10 h-10 text-blue-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Already Submitted</h2>
        <p className="text-gray-500 text-sm mb-4">You have already submitted your examination form.</p>
        <div className="bg-blue-50 rounded-xl p-4 mb-4 text-left">
          <p className="text-xs text-blue-600 font-semibold mb-1">Enrollment Number</p>
          <p className="text-blue-800 font-black text-lg">{existingForm.enrollmentNumber}</p>
          <p className="text-xs text-gray-400 mt-2">Status: <span className={`font-bold ${
            existingForm.status === 'Approved' ? 'text-green-600' :
            existingForm.status === 'Rejected' ? 'text-red-600' : 'text-yellow-600'
          }`}>{existingForm.status}</span></p>
        </div>
        {user && (
          <button onClick={() => navigate('/dashboard')}
            className="w-full px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
            Go to Dashboard
          </button>
        )}
      </motion.div>
    </div>
  );

  if (success) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 pt-28 pb-16 px-4 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-12 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">Form Submitted!</h2>
        <p className="text-gray-500 text-sm mb-2">Your examination form has been successfully submitted.</p>
        <p className="text-gray-500 text-sm mb-6">Admin will review and contact you shortly.</p>
        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-xs text-blue-600 font-semibold mb-1">Enrollment Number</p>
          <p className="text-blue-800 font-black text-lg">{form.enrollmentNumber}</p>
        </div>
        {user ? (
          <button onClick={() => navigate('/dashboard')}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
            Go to Dashboard
          </button>
        ) : (
        <button onClick={() => { setSuccess(false); setForm({ studentName:'',fatherName:'',motherName:'',dob:'',gender:'',category:'General',enrollmentNumber:'',course:'',batch:'',session:'',qualification:'',subjects:'',phone:'',email:'',address:'' }); }}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold hover:shadow-lg transition-all">
          Submit Another Form
        </button>
        )}
      </motion.div>
    </div>
  );

  if (step === 2) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-16 px-4 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 max-w-md w-full text-center">
        <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-4">
          <CreditCard className="w-4 h-4" /> Exam Form Fee Payment
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-1">Pay ₹{FEE_AMOUNT}</h2>
        <p className="text-gray-500 text-sm mb-5">Scan QR code or tap Pay Now to complete payment</p>

        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white rounded-2xl shadow-lg border border-gray-100">
            <QRCodeSVG value={upiLink} size={200} level="H" />
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-3 mb-5 text-sm">
          <p className="text-gray-500">UPI ID</p>
          <p className="font-bold text-gray-800 select-all">{UPI_ID}</p>
          <p className="text-gray-500 mt-1">Amount: <span className="font-bold text-green-600">₹{FEE_AMOUNT}</span></p>
        </div>

        <a href={upiLink}
          className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all mb-4 text-sm">
          📱 Pay Now via UPI App
        </a>

        <div className="flex gap-3">
          <button onClick={() => { setStep(1); setError(''); }}
            className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm">
            Back
          </button>
          <motion.button onClick={() => { setStep(3); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all text-sm flex items-center justify-center gap-2">
            ✅ I Have Paid → Enter UTR
          </motion.button>
        </div>
      </motion.div>
    </div>
  );

  if (step === 3) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-16 px-4 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 max-w-md w-full">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900">Enter UTR Number</h2>
          <p className="text-gray-500 text-sm mt-1">Enter the UTR / Transaction ID from your UPI payment receipt</p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelCls}>UTR / Transaction ID <span className="text-red-500">*</span></label>
            <input
              value={utr} onChange={e => setUtr(e.target.value)}
              placeholder="Enter UTR / Transaction ID"
              className={inputCls} required autoFocus
            />
            <p className="text-xs text-gray-400 mt-1">Find UTR in your UPI app → Payment History → Transaction Details</p>
          </div>

          <div className="bg-green-50 rounded-xl p-3 text-sm border border-green-100">
            <p className="text-green-700 font-semibold">Payment Details</p>
            <p className="text-green-600">UPI ID: {UPI_ID}</p>
            <p className="text-green-600">Amount Paid: ₹{FEE_AMOUNT}</p>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => { setStep(2); setError(''); }}
              className="flex-1 py-3 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all text-sm">
              Back
            </button>
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
              {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</> : <><FileText className="w-4 h-4" /> Submit Form</>}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-24 pb-16 px-4">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold mb-4 shadow-md">
            <FileText className="w-4 h-4" /> Keerti Computer Institute
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900">Examination Registration Form</h1>
          <p className="text-gray-500 mt-2 text-sm">Fill all required fields carefully. Fields marked with <span className="text-red-500 font-bold">*</span> are mandatory.</p>
        </motion.div>

        {error && (
          <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">{error}</div>
        )}

        <form onSubmit={handleFormNext} className="space-y-6">

          {/* Section 1: Personal Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <SectionHeader icon={User} title="Personal Information" color="border-blue-200" />
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Student Name <span className="text-red-500">*</span></label>
                <input name="studentName" value={form.studentName} onChange={handle} required placeholder="Enter full name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Father's Name <span className="text-red-500">*</span></label>
                <input name="fatherName" value={form.fatherName} onChange={handle} required placeholder="Enter father's name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Mother's Name</label>
                <input name="motherName" value={form.motherName} onChange={handle} placeholder="Enter mother's name" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Date of Birth <span className="text-red-500">*</span></label>
                <input type="date" name="dob" value={form.dob} onChange={handle} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Gender <span className="text-red-500">*</span></label>
                <select name="gender" value={form.gender} onChange={handle} required className={selectCls}>
                  <option value="">Select Gender</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <select name="category" value={form.category} onChange={handle} className={selectCls}>
                  <option>General</option>
                  <option>OBC</option>
                  <option>SC</option>
                  <option>ST</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Section 2: Academic Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <SectionHeader icon={BookOpen} title="Academic Information" color="border-indigo-200" />
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Enrollment Number <span className="text-red-500">*</span></label>
                <input name="enrollmentNumber" value={form.enrollmentNumber} onChange={handle} required placeholder="e.g. KCI/2024/DCA/0001" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Course Name <span className="text-red-500">*</span></label>
                <select name="course" value={form.course} onChange={handle} required className={selectCls}>
                  <option value="">Select Course</option>
                  {COURSES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Batch <span className="text-red-500">*</span></label>
                <input name="batch" value={form.batch} onChange={handle} required placeholder="e.g. Jan 2024 – Jun 2024" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Session / Year</label>
                <input name="session" value={form.session} onChange={handle} placeholder="e.g. 2024-25" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Highest Qualification</label>
                <input name="qualification" value={form.qualification} onChange={handle} placeholder="e.g. 12th, Graduation" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Subjects / Specialization</label>
                <input name="subjects" value={form.subjects} onChange={handle} placeholder="e.g. Computer Science, Commerce" className={inputCls} />
              </div>
            </div>
          </motion.div>

          {/* Section 3: Contact Info */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <SectionHeader icon={Phone} title="Contact Information" color="border-emerald-200" />
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className={labelCls}>Phone Number <span className="text-red-500">*</span></label>
                <input type="tel" name="phone" value={form.phone} onChange={handle} required placeholder="10-digit mobile number" maxLength={10} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email Address <span className="text-red-500">*</span></label>
                <input type="email" name="email" value={form.email} onChange={handle} required placeholder="your@email.com" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Full Address</label>
                <textarea name="address" value={form.address} onChange={handle} rows={2} placeholder="House No., Street, City, State, PIN" className={inputCls + ' resize-none'} />
              </div>
            </div>
          </motion.div>



          {/* Declaration + Next */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-start gap-3 mb-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <input type="checkbox" required id="declaration" checked={declared} onChange={e => setDeclared(e.target.checked)} className="mt-0.5 w-4 h-4 accent-blue-600 cursor-pointer" />
              <label htmlFor="declaration" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                I hereby declare that all the information provided above is <strong>true and correct</strong> to the best of my knowledge.
              </label>
            </div>
            <motion.button type="submit" disabled={!declared}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-base rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5" /> Proceed to Payment
            </motion.button>
          </motion.div>

        </form>
      </div>
    </div>
  );
}
