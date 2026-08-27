import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, IndianRupee, BookOpen, CheckCircle, ArrowLeft, GraduationCap, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import api from '../utils/api';
import Loader from '../components/Loader';

export default function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/courses/${id}`)
      .then(({ data }) => setCourse(data.course))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="pt-24 sm:pt-28 min-h-screen flex items-center justify-center"><Loader /></div>;
  if (!course) return <div className="pt-24 sm:pt-28 text-center py-20 text-gray-500 font-medium">Course not found.</div>;

  return (
    <div className="pt-24 sm:pt-28 min-h-screen bg-slate-50">
      {/* Header Banner */}
      <section className="relative bg-slate-950 text-white py-14 sm:py-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/90 via-slate-900/95 to-indigo-950/90" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
          <Link to="/courses" className="inline-flex items-center gap-2 text-blue-300 hover:text-white mb-6 text-xs sm:text-sm font-semibold transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block px-3 py-1 bg-amber-400/20 text-amber-300 border border-amber-400/30 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
              {course.category}
            </span>
            <h1 className="text-3xl sm:text-5xl font-black mb-3 tracking-tight">{course.title}</h1>
            <p className="text-gray-300 text-sm sm:text-base max-w-3xl leading-relaxed font-normal">{course.description}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-12 gap-8">
          {/* Main Syllabus Content */}
          <div className="lg:col-span-8 space-y-8">
            {course.syllabus?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-900 mb-6 flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  Course Curriculum & Syllabus
                </h2>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  {course.syllabus.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-3.5 bg-slate-50/80 rounded-xl border border-gray-100/80">
                      <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-gray-800 text-xs sm:text-sm font-semibold">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {course.eligibility && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-100">
                <h2 className="text-xl font-extrabold text-gray-900 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-blue-600" /> Eligibility Criteria
                </h2>
                <p className="text-gray-700 text-xs sm:text-sm leading-relaxed">{course.eligibility}</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar Summary Card */}
          <div className="lg:col-span-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 sticky top-28 space-y-6">
              {course.image && (
                <img src={course.image} alt={course.title} className="w-full h-44 object-cover rounded-2xl" />
              )}
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm font-medium"><Clock className="w-4 h-4 text-blue-500" /> Duration</div>
                  <span className="font-extrabold text-gray-900 text-xs sm:text-sm">{course.duration}</span>
                </div>
                
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm font-medium"><IndianRupee className="w-4 h-4 text-blue-500" /> Course Fee</div>
                  <span className="font-extrabold text-blue-700 text-xs sm:text-sm">{course.fee === 0 ? 'Contact Us' : `₹${course.fee.toLocaleString()}`}</span>
                </div>
                
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-600 text-xs sm:text-sm font-medium"><GraduationCap className="w-4 h-4 text-blue-500" /> Category</div>
                  <span className="font-extrabold text-gray-900 text-xs sm:text-sm">{course.category}</span>
                </div>
              </div>

              <Link to={`/admission?course=${course._id}`} className="flex items-center justify-center gap-2 w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold rounded-xl text-center shadow-md hover:shadow-lg transition-all text-sm">
                Apply for Admission <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
