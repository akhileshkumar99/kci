import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const TEXT = 'KEERTI COMPUTER INSTITUTE';

export default function Loader() {
  const [visible, setVisible] = useState(true);
  const [displayed, setDisplayed] = useState('');
  const [cursor, setCursor] = useState(true);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const type = setInterval(() => {
      setDisplayed(TEXT.slice(0, i + 1));
      i++;
      if (i >= TEXT.length) { clearInterval(type); setDone(true); }
    }, 30);
    const blink = setInterval(() => setCursor(c => !c), 500);
    const hide = setTimeout(() => setVisible(false), TEXT.length * 30 + 300);
    return () => { clearInterval(type); clearInterval(blink); clearTimeout(hide); };
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' }}
        >
          {/* Ambient glow */}
          <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, #facc15 0%, #f97316 60%, transparent 100%)' }} />

          {/* Logo with spinning ring */}
          <div className="relative mb-8 z-10 flex items-center justify-center">
            {/* Spinning gradient ring */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 140, height: 140,
                background: 'conic-gradient(from 0deg, #60a5fa, #a78bfa, #f472b6, #facc15, #60a5fa)',
                padding: 3,
                borderRadius: '50%',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            />
            <div className="absolute rounded-full bg-[#0f172a]" style={{ width: 134, height: 134 }} />
            <motion.img
              src="/logo.png"
              alt="KCI"
              className="w-32 h-32 rounded-full object-cover object-center relative z-10 overflow-hidden"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
            />
          </div>

          {/* Typewriter text */}
          <div className="relative z-10 text-center px-6">
            <div className="text-2xl sm:text-3xl font-black font-mono tracking-widest text-white min-h-[2.5rem]">
              {displayed}
              <span style={{ opacity: cursor ? 1 : 0, color: '#facc15' }}>|</span>
            </div>
            <motion.div
              className="mt-3 h-0.5 rounded-full"
              style={{ background: 'linear-gradient(90deg, transparent, #facc15, transparent)' }}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: done ? 1 : displayed.length / TEXT.length }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Wave bars */}
          <div className="flex items-end gap-1.5 mt-8 z-10" style={{ height: 48 }}>
            {[...Array(16)].map((_, i) => {
              const colors = ['#60a5fa','#818cf8','#a78bfa','#c084fc','#e879f9','#f472b6','#fb7185','#f97316'];
              return (
                <motion.div
                  key={i}
                  className="rounded-full w-2"
                  style={{ background: colors[i % colors.length] }}
                  animate={{ height: ['25%', `${40 + Math.sin((i / 16) * Math.PI) * 60}%`, '25%'] }}
                  transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.06, ease: 'easeInOut' }}
                />
              );
            })}
          </div>

          <AnimatePresence>
            {done && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4 text-yellow-400/60 text-xs font-mono tracking-[0.4em] uppercase z-10"
              >
                Est. 2006
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
