import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, IndianRupee, BookOpen, CheckCircle, ArrowLeft, GraduationCap } from 'lucide-react';
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

  if (loading) return <div className="pt-16"><Loader /></div>;
  if (!course) return <div className="pt-16 text-center py-20 text-gray-500">Course not found.</div>;

  return (
    <div className="pt-16">
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 py-16 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Link to="/courses" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Courses
          </Link>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-sm mb-3">{course.category}</span>
            <h1 className="text-3xl sm:text-4xl font-bold mb-4">{course.title}</h1>
            <p className="text-blue-200 text-lg max-w-2xl">{course.description}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {course.syllabus?.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-blue-600" /> Course Syllabus
                </h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {course.syllabus.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="text-gray-700 text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {course.eligibility && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Eligibility</h2>
                <p className="text-gray-600">{course.eligibility}</p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 sticky top-20">
              {course.image && (
                <img src={course.image} alt={course.title} className="w-full h-40 object-cover rounded-xl mb-4" />
              )}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-600 text-sm"><Clock className="w-4 h-4 text-blue-500" /> Duration</div>
                  <span className="font-semibold text-gray-900">{course.duration}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-600 text-sm"><IndianRupee className="w-4 h-4 text-blue-500" /> Course Fee</div>
                  <span className="font-semibold text-blue-700">{course.fee === 0 ? 'Contact Us' : `₹${course.fee.toLocaleString()}`}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 text-gray-600 text-sm"><GraduationCap className="w-4 h-4 text-blue-500" /> Category</div>
                  <span className="font-semibold text-gray-900">{course.category}</span>
                </div>
              </div>
              <Link to={`/admission?course=${course._id}`} className="block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-center transition-colors">
                Apply for Admission
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
