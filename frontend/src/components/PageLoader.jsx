import { motion } from 'framer-motion';

// Shimmer skeleton for Suspense fallback
export function SuspenseLoader() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-4">
      <div className="relative flex items-center justify-center" style={{ width: 72, height: 72 }}>
        {/* Spinning gradient ring */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'conic-gradient(from 0deg, #60a5fa, #a78bfa, #f472b6, transparent)',
            padding: 3,
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-[3px] rounded-full bg-white" />
        <img src="/logo.png" alt="KCI" className="w-10 h-10 rounded-full object-cover object-center z-10 relative" />
      </div>
      {/* Shimmer bars */}
      <div className="w-full max-w-md space-y-3">
        {[100, 80, 90].map((w, i) => (
          <motion.div
            key={i}
            className="h-3 rounded-full bg-gray-200 overflow-hidden"
            style={{ width: `${w}%` }}
          >
            <motion.div
              className="h-full w-1/3 rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)' }}
              animate={{ x: ['-100%', '400%'] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.15, ease: 'linear' }}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// Card skeleton grid for content pages (e.g. Courses)
export function CardSkeletonLoader({ count = 8 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
        >
          {/* Image placeholder */}
          <div className="h-40 bg-gray-100 relative overflow-hidden">
            <ShimmerBar />
          </div>
          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-100 rounded-full w-3/4 overflow-hidden relative"><ShimmerBar /></div>
            <div className="h-3 bg-gray-100 rounded-full w-full overflow-hidden relative"><ShimmerBar delay={0.1} /></div>
            <div className="h-3 bg-gray-100 rounded-full w-2/3 overflow-hidden relative"><ShimmerBar delay={0.2} /></div>
            <div className="flex justify-between items-center pt-1">
              <div className="h-5 bg-gray-100 rounded-full w-16 overflow-hidden relative"><ShimmerBar /></div>
              <div className="h-8 bg-gray-100 rounded-xl w-20 overflow-hidden relative"><ShimmerBar /></div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Admin dashboard skeleton
export function AdminLoader() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm space-y-3">
            <div className="flex justify-between">
              <div className="w-11 h-11 rounded-xl bg-gray-100" />
              <div className="w-4 h-4 rounded bg-gray-100" />
            </div>
            <div className="h-7 bg-gray-100 rounded-full w-1/2" />
            <div className="h-3 bg-gray-100 rounded-full w-3/4" />
          </div>
        ))}
      </div>
      {/* Chart placeholders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-64 flex items-end gap-2 pb-8 px-8">
          {[40, 65, 45, 80, 55, 90, 70, 60, 85, 50, 75, 95].map((h, i) => (
            <motion.div
              key={i}
              className="flex-1 bg-blue-100 rounded-t-lg"
              style={{ height: `${h}%` }}
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.08 }}
            />
          ))}
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-64 flex items-center justify-center">
          <motion.div
            className="w-32 h-32 rounded-full border-8 border-gray-100"
            style={{ borderTopColor: '#3b82f6', borderRightColor: '#8b5cf6' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          />
        </div>
      </div>
    </div>
  );
}

// Inline spinner for small areas
export function SpinnerLoader({ size = 8, color = 'blue' }) {
  return (
    <div className="flex items-center justify-center py-12">
      <motion.div
        className={`w-${size} h-${size} rounded-full border-4 border-${color}-100 border-t-${color}-500`}
        animate={{ rotate: 360 }}
        transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

function ShimmerBar({ delay = 0 }) {
  return (
    <motion.div
      className="absolute inset-0 w-1/2"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)' }}
      animate={{ x: ['-100%', '300%'] }}
      transition={{ duration: 1.4, repeat: Infinity, delay, ease: 'linear' }}
    />
  );
}
