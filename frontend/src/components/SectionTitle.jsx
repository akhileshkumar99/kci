import { motion } from 'framer-motion';

export default function SectionTitle({ title, subtitle, badge, center = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={`mb-12 ${center ? 'text-center' : ''}`}
    >
      {badge && (
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-blue-50 text-blue-700 border border-blue-200/80 mb-3 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          {badge}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mt-3 font-normal leading-relaxed mx-auto">
          {subtitle}
        </p>
      )}
      <div className={`mt-4 h-1.5 w-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full ${center ? 'mx-auto' : ''}`} />
    </motion.div>
  );
}
