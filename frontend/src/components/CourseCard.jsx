import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Clock, IndianRupee, BookOpen, ArrowRight, CheckCircle, GraduationCap, Monitor, FileText, Award, Zap, Briefcase } from 'lucide-react';

const categoryConfig = {
  Basic: { color: 'bg-emerald-50 text-emerald-800', border: 'border-emerald-200', gradient: 'from-emerald-600 to-teal-700', Icon: Monitor },
  Certificate: { color: 'bg-blue-50 text-blue-800', border: 'border-blue-200', gradient: 'from-blue-600 to-indigo-700', Icon: FileText },
  Diploma: { color: 'bg-purple-50 text-purple-800', border: 'border-purple-200', gradient: 'from-purple-600 to-violet-700', Icon: GraduationCap },
  Advanced: { color: 'bg-amber-50 text-amber-800', border: 'border-amber-200', gradient: 'from-amber-600 to-orange-700', Icon: Zap },
  Professional: { color: 'bg-teal-50 text-teal-800', border: 'border-teal-200', gradient: 'from-teal-600 to-emerald-700', Icon: Briefcase },
};

export default function CourseCard({ course, index = 0 }) {
  const cfg = categoryConfig[course.category] || categoryConfig.Certificate;
  const CategoryIcon = cfg.Icon;
  const feeDisplay = course.fee === 0 ? 'Contact Us' : `₹${course.fee.toLocaleString()}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.2, delay: (index % 6) * 0.03 }}
      whileHover={{ y: -6 }}
      className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-150 overflow-hidden border-2 border-slate-200 hover:border-blue-500 group flex flex-col"
    >
      {/* Top Header */}
      <div className={`bg-gradient-to-r ${cfg.gradient} p-4 text-white relative overflow-hidden`}>
        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8" />
        <div className="relative flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <span className="inline-block px-3 py-0.5 rounded-full text-xs font-black mb-1.5 bg-white/20 text-white tracking-wide">
              {course.category}
            </span>
            <h3 className="font-extrabold text-white text-base sm:text-lg leading-snug group-hover:text-amber-200 transition-colors line-clamp-2">
              {course.title}
            </h3>
          </div>
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
            <CategoryIcon className="w-4.5 h-4.5 text-white" />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 sm:p-5 flex flex-col flex-1 bg-white">
        <p className="text-slate-800 text-sm sm:text-base leading-relaxed mb-3.5 line-clamp-2 font-bold">{course.description}</p>

        {/* Duration & Fee */}
        <div className="flex items-center justify-between mb-3.5 gap-2">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-950 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg font-black">
            <Clock className="w-4 h-4 text-blue-600" />
            <span>{course.duration}</span>
          </div>
          <div className={`flex items-center gap-1 text-xs sm:text-sm font-black px-3 py-1.5 rounded-lg ${course.fee === 0 ? 'bg-emerald-100 text-emerald-950 border border-emerald-300' : 'bg-blue-100 text-blue-950 border border-blue-300'}`}>
            {course.fee > 0 && <IndianRupee className="w-3.5 h-3.5 text-blue-900" />}
            <span>{feeDisplay}</span>
          </div>
        </div>

        {/* Syllabus Preview */}
        {course.syllabus?.length > 0 && (
          <div className="mb-3.5 flex-1">
            <div className="text-xs font-black text-slate-950 uppercase tracking-wider mb-2 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" /> Topics Covered
            </div>
            <div className="space-y-1.5">
              {course.syllabus.slice(0, 4).map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-slate-900 font-extrabold">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
              {course.syllabus.length > 4 && (
                <div className="text-xs sm:text-sm text-blue-700 font-black pl-6">
                  +{course.syllabus.length - 4} more topics
                </div>
              )}
            </div>
          </div>
        )}

        {/* Eligibility */}
        {course.eligibility && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-950 font-black mb-3.5 bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg">
            <GraduationCap className="w-4 h-4 text-purple-600 shrink-0" />
            <span>{course.eligibility}</span>
          </div>
        )}

        {/* CTA */}
        <Link
          to={`/courses/${course.slug || course._id}`}
          className={`mt-auto flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r ${cfg.gradient} text-white rounded-xl text-xs sm:text-sm font-black transition-all duration-150 shadow-md hover:shadow-lg hover:brightness-105 group/btn`}
        >
          View Details
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </motion.div>
  );
}
