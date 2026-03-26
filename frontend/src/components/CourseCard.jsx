import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, IndianRupee, BookOpen, ArrowRight, CheckCircle, GraduationCap } from 'lucide-react';

const categoryConfig = {
  Basic:        { color: 'bg-green-100 text-green-700',   border: 'border-green-200',   gradient: 'from-green-500 to-green-600',   icon: '🖥️' },
  Certificate:  { color: 'bg-blue-100 text-blue-700',     border: 'border-blue-200',    gradient: 'from-blue-500 to-blue-600',     icon: '📜' },
  Diploma:      { color: 'bg-purple-100 text-purple-700', border: 'border-purple-200',  gradient: 'from-purple-500 to-purple-700', icon: '🎓' },
  Advanced:     { color: 'bg-orange-100 text-orange-700', border: 'border-orange-200',  gradient: 'from-orange-500 to-orange-600', icon: '⚡' },
  Professional: { color: 'bg-teal-100 text-teal-700',     border: 'border-teal-200',    gradient: 'from-teal-500 to-teal-600',     icon: '💼' },
};

export default function CourseCard({ course, index = 0 }) {
  const cfg = categoryConfig[course.category] || categoryConfig.Certificate;
  const feeDisplay = course.fee === 0 ? 'Contact Us' : `₹${course.fee.toLocaleString()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: (index % 6) * 0.08 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className={`bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border-2 ${cfg.border} group flex flex-col`}
    >
      {/* Top gradient bar */}
      <div className={`bg-gradient-to-r ${cfg.gradient} p-5 relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="absolute bottom-0 left-0 w-14 h-14 bg-white/10 rounded-full translate-y-6 -translate-x-6" />
        <div className="relative flex items-start justify-between gap-2">
          <div className="flex-1">
            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 bg-white/20 text-white`}>
              {course.category}
            </span>
            <h3 className="font-bold text-white text-sm leading-snug group-hover:text-yellow-100 transition-colors line-clamp-2">
              {course.title}
            </h3>
          </div>
          <div className="text-2xl shrink-0">{cfg.icon}</div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex flex-col flex-1">
        <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-2">{course.description}</p>

        {/* Duration & Fee */}
        <div className="flex items-center justify-between mb-4 gap-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span className="font-medium">{course.duration}</span>
          </div>
          <div className={`flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg ${course.fee === 0 ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
            {course.fee > 0 && <IndianRupee className="w-3 h-3" />}
            <span>{feeDisplay}</span>
          </div>
        </div>

        {/* Syllabus preview */}
        {course.syllabus?.length > 0 && (
          <div className="mb-4 flex-1">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 flex items-center gap-1">
              <BookOpen className="w-3 h-3" /> Topics Covered
            </div>
            <div className="space-y-1">
              {course.syllabus.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
              {course.syllabus.length > 4 && (
                <div className="text-xs text-blue-500 font-medium pl-4.5">
                  +{course.syllabus.length - 4} more topics
                </div>
              )}
            </div>
          </div>
        )}

        {/* Eligibility */}
        {course.eligibility && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 bg-gray-50 px-3 py-1.5 rounded-lg">
            <GraduationCap className="w-3.5 h-3.5 text-purple-500 shrink-0" />
            <span>{course.eligibility}</span>
          </div>
        )}

        {/* CTA */}
        <Link
          to={`/courses/${course.slug || course._id}`}
          className={`mt-auto flex items-center justify-center gap-2 w-full py-2.5 bg-gradient-to-r ${cfg.gradient} text-white rounded-xl text-sm font-semibold transition-all hover:opacity-90 group/btn`}
        >
          View Details
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
