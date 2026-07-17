import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Loader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hide = setTimeout(() => setVisible(false), 800);
    return () => clearTimeout(hide);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}
        >
          <div className="relative flex items-center justify-center">
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 120, height: 120,
                background: 'conic-gradient(from 0deg, #60a5fa, #a78bfa, #f472b6, #facc15, #60a5fa)',
                padding: 3, borderRadius: '50%',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute rounded-full bg-[#0f172a]" style={{ width: 114, height: 114 }} />
            <img src="/logo.png" alt="KCI" className="w-28 h-28 rounded-full object-cover relative z-10" />
          </div>
          <div className="mt-5 text-white font-black text-lg tracking-widest font-mono">KCI</div>
          <div className="mt-2 text-yellow-400/70 text-xs tracking-widest">Loading...</div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
