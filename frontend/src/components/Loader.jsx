import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PETALS = 10;
const ORBIT_DOTS = 6;

export default function Loader() {
  const [visible, setVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); return 100; }
        return p + 2;
      });
    }, 30);
    const timer = setTimeout(() => setVisible(false), 2200);
    return () => { clearInterval(interval); clearTimeout(timer); };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e3a5f] to-[#1e1b4b] overflow-hidden"
        >
          {/* Ripple background rings */}
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border border-white/5"
              style={{ width: 180 + i * 120, height: 180 + i * 120 }}
              animate={{ scale: [1, 1.15, 1], opacity: [0.08, 0.2, 0.08] }}
              transition={{ duration: 2.5 + i * 0.5, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}

          {/* Main loader container */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.7, type: 'spring', stiffness: 180 }}
            className="relative flex flex-col items-center mb-10"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>

              {/* Outer orbit dots */}
              <motion.svg
                animate={{ rotate: hovered ? -360 : 360 }}
                transition={{ duration: hovered ? 0.8 : 3, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
                width="160" height="160" viewBox="0 0 160 160"
              >
                {[...Array(ORBIT_DOTS)].map((_, i) => {
                  const angle = (i * 60 * Math.PI) / 180;
                  const cx = 80 + 72 * Math.cos(angle);
                  const cy = 80 + 72 * Math.sin(angle);
                  const colors = ['#60a5fa','#f472b6','#34d399','#facc15','#a78bfa','#fb923c'];
                  return (
                    <motion.circle
                      key={i}
                      cx={cx} cy={cy} r={hovered ? 7 : 5}
                      fill={colors[i]}
                      animate={{ r: hovered ? [7, 10, 7] : [5, 7, 5] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.1 }}
                    />
                  );
                })}
              </motion.svg>

              {/* Inner petals ring */}
              <motion.svg
                animate={{ rotate: hovered ? 360 : -360 }}
                transition={{ duration: hovered ? 0.9 : 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0"
                width="160" height="160" viewBox="0 0 160 160"
              >
                {[...Array(PETALS)].map((_, i) => {
                  const angle = i * 36;
                  const opacity = 0.25 + (i / PETALS) * 0.75;
                  const hue = i * 36;
                  return (
                    <ellipse
                      key={i}
                      cx="80" cy="30"
                      rx="7" ry="14"
                      fill={`hsl(${hue}, 90%, 65%)`}
                      opacity={opacity}
                      transform={`rotate(${angle} 80 80)`}
                    />
                  );
                })}
              </motion.svg>

              {/* Glow pulse behind logo */}
              <motion.div
                className="absolute rounded-full"
                style={{ width: 90, height: 90, background: 'radial-gradient(circle, rgba(250,204,21,0.35) 0%, transparent 70%)' }}
                animate={{ scale: hovered ? [1, 1.5, 1] : [1, 1.25, 1], opacity: hovered ? [0.6, 1, 0.6] : [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />

              {/* Logo */}
              <motion.img
                src="/logo.png"
                alt="KCI"
                className="relative w-20 h-20 rounded-full object-cover shadow-2xl ring-4 ring-yellow-400/30 z-10"
                animate={{ scale: hovered ? 1.12 : 1 }}
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-center mt-5"
            >
              <motion.div
                className="text-3xl font-black tracking-widest"
                animate={{ color: hovered ? '#facc15' : '#ffffff' }}
                transition={{ duration: 0.3 }}
              >
                KEERTI
              </motion.div>
              <div className="text-yellow-400 text-xs font-bold tracking-[0.3em] uppercase mt-1">
                Computer Institute
              </div>
            </motion.div>
          </motion.div>

          {/* Progress bar */}
          <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #60a5fa, #a78bfa, #f472b6, #facc15)',
                backgroundSize: '200% 100%',
              }}
              animate={{ backgroundPosition: ['0% 0%', '100% 0%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Dots loading indicator */}
          <div className="flex gap-2 mt-5">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-yellow-400"
                animate={{ y: [0, -8, 0], opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
