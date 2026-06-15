import { useState, useRef, useEffect } from 'react';

export default function DevCredit({ dark = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('touchstart', handler); };
  }, [open]);

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${dark ? 'bg-gray-800/60 border-gray-700' : 'bg-gradient-to-r from-blue-50 via-violet-50 to-pink-50 border-violet-100'}`}>
      <span className={`text-[10px] ${dark ? 'text-gray-500' : 'text-gray-400'}`}>Developed by</span>
      <div ref={ref} className="relative group cursor-pointer" onClick={() => setOpen(p => !p)}>
        <span className="text-[11px] font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500 select-none">
          Akhilesh Kumar
        </span>
        {/* Popup — hover (desktop) OR click/tap (mobile) */}
        <div className={`absolute bottom-7 left-1/2 -translate-x-1/2 w-72 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-4 transition-all duration-200 z-[999]
          pointer-events-none group-hover:pointer-events-auto
          scale-95 group-hover:scale-100
          opacity-0 group-hover:opacity-100
          ${open ? '!opacity-100 !scale-100 !pointer-events-auto' : ''}`}>
          <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-700">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-pink-500 flex items-center justify-center text-white font-black text-lg shrink-0">A</div>
            <div>
              <div className="text-white font-black text-sm">🚀 Akhilesh Kumar</div>
              <div className="text-blue-400 text-[10px] font-semibold">Full Stack Web Developer & Founder</div>
              <div className="text-violet-400 text-[10px]">Akhilesh Infotech</div>
            </div>
          </div>
          <p className="text-gray-400 text-[10px] leading-relaxed mb-2">
            💻 Web Apps, Institute Management, E-Commerce, WordPress, Python & Django, AI Solutions, Accounting & MS Office Software.
          </p>
          <p className="text-gray-400 text-[10px] leading-relaxed mb-3">
            ⚡ React, Next.js, Node.js, MongoDB, Python, Django, Cloud & AI Tools.
          </p>
          <div className="space-y-1.5">
            <a href="mailto:akhileshkumar75614@gmail.com" className="flex items-center gap-1.5 text-[10px] text-gray-300 hover:text-blue-400 transition-colors">
              📧 akhileshkumar75614@gmail.com
            </a>
            <a href="https://wa.me/917985875044" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[10px] text-gray-300 hover:text-green-400 transition-colors">
              📱 +91 7985875044 (WhatsApp)
            </a>
            <div className="text-[10px] text-gray-500">🌐 Web, Software, AI, SEO, Cloud & IT Consulting</div>
          </div>
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-gray-900 border-r border-b border-gray-700 rotate-45" />
        </div>
      </div>
      <span className="text-[10px] animate-pulse">⚡</span>
    </div>
  );
}
