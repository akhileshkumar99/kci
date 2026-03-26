import { motion } from 'framer-motion';

export default function SectionTitle({ title, subtitle, center = true }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`mb-10 ${center ? 'text-center' : ''}`}
    >
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">{title}</h2>
      {subtitle && <p className="text-gray-500 text-lg max-w-2xl mx-auto">{subtitle}</p>}
      <div className={`mt-4 h-1 w-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-full ${center ? 'mx-auto' : ''}`} />
    </motion.div>
  );
}
